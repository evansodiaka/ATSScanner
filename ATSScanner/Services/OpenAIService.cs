using OpenAI;
using OpenAI.Chat;
using Microsoft.Extensions.Logging;

namespace ATSScanner.Services
{
    public class ResumeAnalysisResult
    {
        public double Score { get; set; }
        public string Analysis { get; set; }
        public string OptimizedResume { get; set; }
    }

    public class OpenAIService
    {
        private readonly string _apiKey;
        private readonly string _model;
        private readonly ILogger<OpenAIService> _logger;

        public OpenAIService(IConfiguration configuration, ILogger<OpenAIService> logger)
        {
            _apiKey = configuration["OpenAI:ApiKey"];
            _model = "gpt-4.1"; // or "gpt-4" if you have access
            _logger = logger;
        }

        public async Task<ResumeAnalysisResult> AnalyzeResumeAsync(string content, string? jobDescription = null, string? jobTitle = null, string? companyName = null)
        {
            try
            {
                var client = new OpenAIClient(_apiKey);
                
                // Build the analysis prompt based on whether job description is provided
                string userPrompt;
                if (!string.IsNullOrWhiteSpace(jobDescription))
                {
                    userPrompt = $@"Analyze the provided resume against the supplied job description and deliver a comprehensive response formatted as clean HTML that will render beautifully with proper bullet points, headings, and styling.

<div class='analysis-section'>
<h2 class='section-title'>SECTION 1 – ANALYSIS</h2>

<div class='score-section'>
<h3>ATS Compatibility & Job Match Score</h3>
<ul>
<li><strong>Score: [0-100]/100</strong></li>
</ul>
</div>

<div class='feedback-section'>
<h3>Detailed Feedback</h3>
<ul>
<li>[Compare resume to job requirements]</li>
<li>[Highlight strengths and areas for improvement]</li>
<li>[Each feedback point as separate bullet]</li>
</ul>
</div>

<div class='suggestions-section'>
<h3>Alignment Suggestions</h3>
<ul>
<li>[List specific changes to improve match - use <strong>bold</strong> for keywords]</li>
<li>[Each suggestion as separate bullet point]</li>
</ul>
</div>

<div class='keywords-section'>
<h3>Keywords to Add or Emphasize</h3>
<ul>
<li>[Keyword 1]</li>
<li>[Keyword 2]</li>
<li>[Each keyword as separate bullet]</li>
</ul>
</div>

<div class='professionalism-section'>
<h3>Human Touch & Professionalism</h3>
<ul>
<li>[Suggestion for tone or style]</li>
<li>[Each suggestion as separate bullet]</li>
</ul>
</div>
</div>

<div class='optimized-section'>
<h2 class='section-title'>SECTION 2 – OPTIMIZED RESUME</h2>

<div class='job-details'>
<p><strong>Job Title:</strong> {jobTitle ?? "Not specified"}</p>
<p><strong>Company:</strong> {companyName ?? "Not specified"}</p>
</div>

<div class='resume-content'>
<h3>EXPERIENCE</h3>
<ul>
<li>[Job title and company]</li>
<li>[Responsibility with <strong>keywords</strong> bolded]</li>
<li>[Each responsibility as separate bullet]</li>
</ul>

<h3>EDUCATION</h3>
<ul>
<li>[Degree and institution]</li>
</ul>

<h3>SKILLS</h3>
<ul>
<li><strong>[Important Skill 1]</strong></li>
<li><strong>[Important Skill 2]</strong></li>
<li>[Each skill as separate bullet]</li>
</ul>
</div>
</div>

**Job Description:**
{jobDescription}

**Original Resume Content:**
{content}

Format the entire response as clean HTML. Users should see beautifully formatted content with proper bullet points, headings, and bold text when this HTML is rendered.";
                }
                else
                {
                    userPrompt = $@"Analyze the provided resume and deliver a comprehensive response formatted as clean HTML that will render beautifully with proper bullet points, headings, and styling.

<div class='analysis-section'>
<h2 class='section-title'>SECTION 1 – ANALYSIS</h2>

<div class='score-section'>
<h3>ATS Compatibility Score</h3>
<ul>
<li><strong>Score: [0-100]/100</strong></li>
</ul>
</div>

<div class='feedback-section'>
<h3>Detailed Feedback</h3>
<ul>
<li>[Analyze resume strengths and areas for improvement]</li>
<li>[Highlight professional accomplishments]</li>
<li>[Each feedback point as separate bullet]</li>
</ul>
</div>

<div class='suggestions-section'>
<h3>General Improvement Suggestions</h3>
<ul>
<li>[List specific changes to improve ATS compatibility]</li>
<li>[Use <strong>bold</strong> for key areas that need attention]</li>
<li>[Each suggestion as separate bullet]</li>
</ul>
</div>

<div class='keywords-section'>
<h3>Keywords to Add or Emphasize</h3>
<ul>
<li>[Suggested keyword 1]</li>
<li>[Suggested keyword 2]</li>
<li>[Each keyword as separate bullet]</li>
</ul>
</div>

<div class='professionalism-section'>
<h3>Human Touch & Professionalism</h3>
<ul>
<li>[Suggestion for tone or style]</li>
<li>[Each suggestion as separate bullet]</li>
</ul>
</div>
</div>

<div class='optimized-section'>
<h2 class='section-title'>SECTION 2 – OPTIMIZED RESUME</h2>

<div class='resume-content'>
<h3>EXPERIENCE</h3>
<ul>
<li>[Job title and company]</li>
<li>[Responsibility with <strong>keywords</strong> bolded]</li>
<li>[Each responsibility as separate bullet]</li>
</ul>

<h3>EDUCATION</h3>
<ul>
<li>[Degree and institution]</li>
</ul>

<h3>SKILLS</h3>
<ul>
<li><strong>[Important Skill 1]</strong></li>
<li><strong>[Important Skill 2]</strong></li>
<li>[Each skill as separate bullet]</li>
</ul>
</div>
</div>

**Original Resume Content:**
{content}

Format the entire response as clean HTML. Users should see beautifully formatted content with proper bullet points, headings, and bold text when this HTML is rendered.";
                }

                var messages = new List<Message>
                {
                    new Message(Role.System, "You are an expert ATS (Applicant Tracking System) analyzer and professional resume writer with 15+ years of experience. You specialize in creating resumes that achieve 90%+ ATS compatibility while maintaining natural, human-readable language. When creating optimized resumes, you maintain all factual information while strategically incorporating relevant keywords and using powerful action verbs. Your writing style is professional, concise, and results-oriented. Always format your responses as clean HTML that will render beautifully with proper structure, bullet points, and styling."),
                    new Message(Role.User, userPrompt)
                };
                    
                var chatRequest = new ChatRequest(messages, _model);
                var response = await client.ChatEndpoint.GetCompletionAsync(chatRequest);
                
                // Handle the response content properly
                string responseText;
                var messageContent = response.Choices[0].Message.Content;
                
                if (messageContent is string str)
                {
                    responseText = str;
                }
                else if (messageContent is System.Text.Json.JsonElement jsonElement)
                {
                    responseText = jsonElement.GetString() ?? string.Empty;
                }
                else
                {
                    responseText = messageContent?.ToString() ?? string.Empty;
                }

                // Split the response into analysis and optimized resume sections
                string analysis = responseText;
                string optimizedResume = "";
                
                // Look for the optimized section div
                var optimizedSectionStart = responseText.IndexOf("<div class='optimized-section'>", StringComparison.OrdinalIgnoreCase);
                if (optimizedSectionStart < 0)
                {
                    optimizedSectionStart = responseText.IndexOf("<div class=\"optimized-section\">", StringComparison.OrdinalIgnoreCase);
                }

                if (optimizedSectionStart >= 0)
                {
                    analysis = responseText.Substring(0, optimizedSectionStart).Trim();
                    optimizedResume = responseText.Substring(optimizedSectionStart).Trim();
                }

                // Extract score from the analysis section
                var scoreMatch = System.Text.RegularExpressions.Regex.Match(analysis, @"\b(\d{1,3})\b");
                double score = 0;
                if (scoreMatch.Success && double.TryParse(scoreMatch.Value, out score))
                {
                    score = Math.Min(score, 100); // Cap score at 100
                }

                return new ResumeAnalysisResult
                {
                    Score = score,
                    Analysis = analysis,
                    OptimizedResume = optimizedResume
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing resume with OpenAI");
                
                // Check for quota exceeded error
                if (ex.Message.Contains("insufficient_quota") || ex.Message.Contains("quota"))
                {
                    return new ResumeAnalysisResult
                    {
                        Score = 0,
                        Analysis = "<div class='error-section'><h3>Error</h3><ul><li><strong>OpenAI API quota exceeded.</strong> Please check your billing status or use a different API key.</li></ul></div>",
                        OptimizedResume = ""
                    };
                }

                return new ResumeAnalysisResult
                {
                    Score = 0,
                    Analysis = $"<div class='error-section'><h3>Error</h3><ul><li><strong>Error analyzing resume:</strong> {ex.Message}</li></ul></div>",
                    OptimizedResume = ""
                };
            }
        }
    }
}
