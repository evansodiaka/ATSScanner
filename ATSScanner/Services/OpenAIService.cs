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
                    var jobInfo = $"{jobTitle ?? "this position"}";
                    if (!string.IsNullOrWhiteSpace(companyName))
                    {
                        jobInfo += $" at {companyName}";
                    }

                    userPrompt = $"Analyze this resume against the provided job description and provide a comprehensive response with TWO main sections:\n\n" +
                               $"SECTION 1 - ANALYSIS:\n" +
                               $"1. A score from 0-100 for ATS compatibility and job match\n" +
                               $"2. Detailed feedback comparing the resume to the job requirements\n" +
                               $"3. Specific suggestions for improving alignment with the job description\n" +
                               $"4. Keywords and skills that should be emphasized or added\n\n" +
                               $"SECTION 2 - OPTIMIZED RESUME:\n" +
                               $"Create a completely rewritten and optimized version of this resume that:\n" +
                               $"- Targets 90%+ ATS compatibility for this specific job\n" +
                               $"- Incorporates relevant keywords from the job description naturally\n" +
                               $"- Maintains all factual information from the original resume\n" +
                               $"- Uses strong action verbs and quantified achievements\n" +
                               $"- Follows ATS-friendly formatting (clear sections, bullet points, standard headings)\n" +
                               $"- Emphasizes skills and experiences most relevant to the job\n" +
                               $"- Keep the content length similar to the original\n\n" +
                               $"Please clearly separate these sections with '--- OPTIMIZED RESUME ---' as a delimiter.\n\n" +
                               $"Job Title: {jobTitle ?? "Not specified"}\n" +
                               $"Company: {companyName ?? "Not specified"}\n\n" +
                               $"Job Description:\n{jobDescription}\n\n" +
                               $"Original Resume Content:\n{content}";
                }
                else
                {
                    userPrompt = $"Analyze this resume and provide a comprehensive response with TWO main sections:\n\n" +
                               $"SECTION 1 - ANALYSIS:\n" +
                               $"1. A score from 0-100 for ATS compatibility\n" +
                               $"2. Detailed feedback about the resume's strengths and areas for improvement\n" +
                               $"3. General suggestions for improving ATS compatibility\n\n" +
                               $"SECTION 2 - OPTIMIZED RESUME:\n" +
                               $"Create a completely rewritten and optimized version of this resume that:\n" +
                               $"- Targets 90%+ ATS compatibility\n" +
                               $"- Uses industry-standard keywords and terminology\n" +
                               $"- Maintains all factual information from the original resume\n" +
                               $"- Uses strong action verbs and quantified achievements\n" +
                               $"- Follows ATS-friendly formatting (clear sections, bullet points, standard headings)\n" +
                               $"- Keep the content length similar to the original\n\n" +
                               $"Please clearly separate these sections with '--- OPTIMIZED RESUME ---' as a delimiter.\n\n" +
                               $"Original Resume Content:\n{content}";
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
                
                var delimiter = "--- OPTIMIZED RESUME ---";
                var delimiterIndex = responseText.IndexOf(delimiter, StringComparison.OrdinalIgnoreCase);
                
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
