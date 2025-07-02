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
                    userPrompt = $@"Analyze the provided resume against the supplied job description and deliver a comprehensive, human-centric response with TWO main sections, using **bold headings** and **larger font sizes** for section titles to maximize readability.
# **SECTION 1 – ANALYSIS**
**(Use a large, bold font for this heading)**
- **ATS Compatibility & Job Match Score:**  
  (Provide a score from 0–100)
- **Detailed Feedback:**  
  - Compare the resume to the job requirements.  
  - Highlight strengths and areas for improvement.
- **Alignment Suggestions:**  
  - List specific changes to improve match with the job description.
  - Bold or highlight keywords, skills, or achievements to prioritize.
- **Keywords to Add or Emphasize:**  
  - Clearly list the most important keywords and skills from the job description that should be incorporated.
- **Human Touch & Professionalism:**  
  - Suggest ways to make the resume sound approachable and engaging while maintaining a professional tone.

---

# **SECTION 2 – OPTIMIZED RESUME**
**(Begin this section with a large, bold title)**
Create a rewritten, ATS-optimized, and human-centered version of the resume that:
- Targets **90%+ ATS compatibility** for the specific job.
- Seamlessly incorporates the top keywords and skills.
- **Uses strong action verbs** and quantifies achievements.
- **Presents responsibilities and accomplishments in clear bullet points**.
- Emphasizes both technical and soft skills relevant to the role.
- **Maintains a professional, yet personable and genuine tone**.
- Keeps information factually accurate and similar in length to the original.
- Uses **modern, ATS-friendly formatting**—use bold and font size increases for section headings (e.g., EXPERIENCE, EDUCATION), and bullet points within each section.
- Please separate sections with '**--- OPTIMIZED RESUME ---**' in bold.

---

**Job Title:** {jobTitle ?? "Not specified"}  
**Company:** {companyName ?? "Not specified"}  

**Job Description:**  
{jobDescription}

**Original Resume Content:**  
{content}";
                }
                else
                {
                    userPrompt = $@"Analyze the provided resume and deliver a comprehensive, human-centric response with TWO main sections, using **bold headings** and **larger font sizes** for section titles to maximize readability.

# **SECTION 1 – ANALYSIS**
**(Use a large, bold font for this heading)**
- **ATS Compatibility Score:**  
  (Provide a score from 0–100)
- **Detailed Feedback:**  
  - Analyze the resume's strengths and areas for improvement.  
  - Highlight professional accomplishments and formatting.
- **General Improvement Suggestions:**  
  - List specific changes to improve ATS compatibility.
  - Bold or highlight key areas that need attention.
- **Keywords to Add or Emphasize:**  
  - Suggest industry-standard keywords and skills that should be incorporated.
- **Human Touch & Professionalism:**  
  - Suggest ways to make the resume sound approachable and engaging while maintaining a professional tone.

---

# **SECTION 2 – OPTIMIZED RESUME**
**(Begin this section with a large, bold title)**
Create a rewritten, ATS-optimized, and human-centered version of the resume that:
- Targets **90%+ ATS compatibility**.
- Incorporates industry-standard keywords and terminology.
- **Uses strong action verbs** and quantifies achievements.
- **Presents responsibilities and accomplishments in clear bullet points**.
- Emphasizes both technical and soft skills.
- **Maintains a professional, yet personable and genuine tone**.
- Keeps information factually accurate and similar in length to the original.
- Uses **modern, ATS-friendly formatting**—use bold and font size increases for section headings (e.g., EXPERIENCE, EDUCATION), and bullet points within each section.
- Please separate sections with '**--- OPTIMIZED RESUME ---**' in bold.

---

**Original Resume Content:**  
{content}";
                }

                var messages = new List<Message>
                {
                    new Message(Role.System, "You are an expert ATS (Applicant Tracking System) analyzer and professional resume writer with 15+ years of experience. You specialize in creating resumes that achieve 90%+ ATS compatibility while maintaining natural, human-readable language. When creating optimized resumes, you maintain all factual information while strategically incorporating relevant keywords and using powerful action verbs. Your writing style is professional, concise, and results-oriented."),
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
                
                // Try to find the bold delimiter first, then fallback to regular delimiter
                var boldDelimiter = "**--- OPTIMIZED RESUME ---**";
                var regularDelimiter = "--- OPTIMIZED RESUME ---";
                var delimiterIndex = responseText.IndexOf(boldDelimiter, StringComparison.OrdinalIgnoreCase);
                string delimiter = boldDelimiter;
                
                if (delimiterIndex < 0)
                {
                    delimiterIndex = responseText.IndexOf(regularDelimiter, StringComparison.OrdinalIgnoreCase);
                    delimiter = regularDelimiter;
                }
                
                if (delimiterIndex >= 0)
                {
                    analysis = responseText.Substring(0, delimiterIndex).Trim();
                    optimizedResume = responseText.Substring(delimiterIndex + delimiter.Length).Trim();
                }

                // Extract score from the analysis section
                var scoreMatch = System.Text.RegularExpressions.Regex.Match(analysis, @"\b\d{1,3}\b");
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
                        Analysis = "Error: OpenAI API quota exceeded. Please check your billing status or use a different API key.",
                        OptimizedResume = ""
                    };
                }

                return new ResumeAnalysisResult
                {
                    Score = 0,
                    Analysis = $"Error analyzing resume: {ex.Message}",
                    OptimizedResume = ""
                };
            }
        }
    }
}
