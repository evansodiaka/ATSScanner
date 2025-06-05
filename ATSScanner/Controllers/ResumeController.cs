using Microsoft.AspNetCore.Mvc;
using ATSScanner.Models;
using ATSScanner.Services;
using ATSScanner.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Text;

namespace ATSScanner.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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

        [HttpPost("upload")]
        public async Task<IActionResult> UploadResume(IFormFile file, [FromQuery] string industry = "General")
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

                // Create resume record
                var resume = new Resume
                {
                    FileName = file.FileName,
                    Content = content,
                    UploadDate = DateTime.UtcNow
                };

                _context.Resumes.Add(resume);
                await _context.SaveChangesAsync();

                // Perform ATS scoring
                var atsScore = await _atsScoringService.ScoreResumeAsync(content, industry);

                // Perform AI analysis
                var aiAnalysis = await _openAIService.AnalyzeResumeAsync(content);

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
                    content,
                    atsScore,
                    aiAnalysis = new
                    {
                        score = aiAnalysis.Score,
                        analysis = aiAnalysis.Analysis
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing resume upload");
                return StatusCode(500, $"Error processing resume: {ex.Message}");
            }
        }
    }
}