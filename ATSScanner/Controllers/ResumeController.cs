using Microsoft.AspNetCore.Mvc;
using ATSScanner.Models;
using ATSScanner.Services;
using ATSScanner.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace ATSScanner.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ResumeController : ControllerBase
    {
        private readonly ILogger<ResumeController> _logger;
        private readonly DataContext _context;
        private readonly DocumentParserService _documentParser;
        private readonly PdfParserService _pdfParser;
        private readonly AtsScoringService _atsScoringService;
        private readonly OpenAIService _openAIService;

        public ResumeController(
            ILogger<ResumeController> logger,
            DataContext context,
            DocumentParserService documentParser,
            PdfParserService pdfParser,
            AtsScoringService atsScoringService,
            OpenAIService openAIService)
        {
            _logger = logger;
            _context = context;
            _documentParser = documentParser;
            _pdfParser = pdfParser;
            _atsScoringService = atsScoringService;
            _openAIService = openAIService;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID not found in token");
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadResume(
            IFormFile file,
            [FromQuery] string industry = "General",
            [FromQuery] string? jobTitle = null,
            [FromQuery] string? companyName = null,
            [FromQuery] string? jobDescription = null)
        {
            try
            {
                _logger.LogInformation($"Received file upload request: {file.FileName}, ContentType: {file.ContentType}, Industry: {industry}");

                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded");
                }

                // Validate file type
                var allowedTypes = new[] {
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "text/plain"
                };

                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                {
                    return BadRequest($"Unsupported file type: {file.ContentType}. Supported types are: PDF, DOCX, and TXT");
                }

                // Create a memory stream to avoid stream position issues
                using var memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                memoryStream.Position = 0; // Reset position to start

                string content;
                try
                {
                    if (file.ContentType.ToLower() == "application/pdf")
                    {
                        content = await _pdfParser.ExtractTextFromPdf(memoryStream);
                    }
                    else
                    {
                        content = await _documentParser.ExtractTextFromDocument(memoryStream, file.ContentType);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error extracting text from file");
                    return StatusCode(500, $"Error processing file: {ex.Message}");
                }

                if (string.IsNullOrWhiteSpace(content))
                {
                    return BadRequest("No text content could be extracted from the file");
                }

                // Get current user ID
                var userId = GetCurrentUserId();

                // Create resume record
                var resume = new Resume
                {
                    FileName = file.FileName,
                    Content = content,
                    UploadDate = DateTime.UtcNow,
                    UserId = userId
                };

                _context.Resumes.Add(resume);
                await _context.SaveChangesAsync();

                // Perform ATS scoring
                var atsScore = await _atsScoringService.ScoreResumeAsync(content, industry);

                // Perform AI analysis
                var aiAnalysis = await _openAIService.AnalyzeResumeAsync(content, jobDescription, jobTitle, companyName);

                // Create analysis record
                var analysis = new ResumeAnalysis
                {
                    ResumeId = resume.Id,
                    AtsScore = atsScore,
                    AiScore = aiAnalysis.Score,
                    Feedback = aiAnalysis.Analysis
                };

                _context.ResumeAnalyses.Add(analysis);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    resumeId = resume.Id,
                    content,
                    atsScore,
                    aiAnalysis = new
                    {
                        score = aiAnalysis.Score,
                        analysis = aiAnalysis.Analysis,
                        optimizedResume = aiAnalysis.OptimizedResume
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing resume upload");
                return StatusCode(500, $"Error processing resume: {ex.Message}");
            }
        }

        [HttpGet("my-resumes")]
        public async Task<IActionResult> GetMyResumes()
        {
            try
            {
                var userId = GetCurrentUserId();
                var resumes = await _context.Resumes
                    .Where(r => r.UserId == userId)
                    .Include(r => r.Analysis)
                    .OrderByDescending(r => r.UploadDate)
                    .Select(r => new
                    {
                        r.Id,
                        r.FileName,
                        r.UploadDate,
                        atsScore = r.Analysis != null ? r.Analysis.AtsScore : 0,
                        aiScore = r.Analysis != null ? r.Analysis.AiScore : 0
                    })
                    .ToListAsync();

                return Ok(resumes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user resumes");
                return StatusCode(500, "Error fetching resumes");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetResume(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var resume = await _context.Resumes
                    .Include(r => r.Analysis)
                    .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

                if (resume == null)
                {
                    return NotFound("Resume not found");
                }

                return Ok(new
                {
                    resume.Id,
                    resume.FileName,
                    resume.Content,
                    resume.UploadDate,
                    analysis = resume.Analysis != null ? new
                    {
                        atsScore = resume.Analysis.AtsScore,
                        aiScore = resume.Analysis.AiScore,
                        feedback = resume.Analysis.Feedback
                    } : null
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching resume");
                return StatusCode(500, "Error fetching resume");
            }
        }
    }
}