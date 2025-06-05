using OpenAI;
using OpenAI.Chat;
using Microsoft.Extensions.Logging;

namespace ATSScanner.Services
{
    public class ResumeAnalysisResult
    {
        public double Score { get; set; }
        public string Analysis { get; set; }
    }

    public class OpenAIService
    {
        private readonly string _apiKey;
        private readonly string _model;
        private readonly ILogger<OpenAIService> _logger;

        public OpenAIService(IConfiguration configuration, ILogger<OpenAIService> logger)
        {
            _apiKey = configuration["OpenAI:ApiKey"];
            _model = "gpt-3.5-turbo"; // or "gpt-4" if you have access
            _logger = logger;
        }

        public async Task<ResumeAnalysisResult> AnalyzeResumeAsync(string content)
        {
            try
            {
                var client = new OpenAIClient(_apiKey);
                var messages = new List<Message>
                {
                    new Message(Role.System, "You are an expert ATS (Applicant Tracking System) analyzer. Analyze resumes and provide a score from 0-100 along with detailed feedback about what's good and what could be improved."),
                    new Message(Role.User, $"Analyze this resume and provide:\n1. A score from 0-100 for ATS compatibility\n2. Detailed feedback about the resume's strengths and areas for improvement\n\nResume content:\n{content}")
                };

                var chatRequest = new ChatRequest(messages, _model);
                var response = await client.ChatEndpoint.GetCompletionAsync(chatRequest);
                var responseText = response.Choices[0].Message.Content;

                var scoreMatch = System.Text.RegularExpressions.Regex.Match(responseText, @"\b\d{1,3}\b");
                double score = 0;
                if (scoreMatch.Success && double.TryParse(scoreMatch.Value, out score))
                {
                    score = Math.Min(score, 100); // Cap score at 100
                }

                return new ResumeAnalysisResult
                {
                    Score = score,
                    Analysis = responseText
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
                        Analysis = "Error: OpenAI API quota exceeded. Please check your billing status or use a different API key."
                    };
                }

                return new ResumeAnalysisResult
                {
                    Score = 0,
                    Analysis = $"Error analyzing resume: {ex.Message}"
                };
            }
        }
    }
}
