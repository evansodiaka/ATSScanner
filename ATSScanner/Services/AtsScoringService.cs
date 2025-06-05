using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ATSScanner.Services
{
    public class AtsScoringService
    {
        private readonly List<string> _commonKeywords = new List<string>
           {
               "experience", "skills", "education", "certification", "project", "leadership", "team", "communication", "problem solving", "analytical", "technical", "software", "database", "programming", "management", "marketing", "sales", "customer service", "research", "development"
           };

        private readonly Dictionary<string, List<string>> _industryKeywords = new Dictionary<string, List<string>>
           {
               { "Tech", new List<string> { "Python", "AWS", "CI/CD", "Docker", "Kubernetes", "JavaScript", "React", "Node.js", "SQL", "Git" } },
               { "Marketing", new List<string> { "SEO", "SEM", "Social Media", "Analytics", "Campaign", "Content", "Digital", "Brand", "Strategy", "ROI" } },
               { "Finance", new List<string> { "Accounting", "Excel", "Financial Analysis", "Budgeting", "Forecasting", "Audit", "Tax", "Compliance", "Risk Management", "Investments" } },
               { "Healthcare", new List<string> { "Patient Care", "Medical", "Nursing", "Clinical", "HIPAA", "EMR", "Diagnosis", "Treatment", "Pharmacy", "Healthcare Management" } }
           };

        private readonly OpenAIService _openAiService;

        public AtsScoringService(OpenAIService openAiService)
        {
            _openAiService = openAiService;
        }

        public async Task<double> ScoreResumeAsync(string content, string industry)
        {
            if (string.IsNullOrEmpty(content))
                return 0;

            var score = 0.0;

            // 1. Keyword Matching (20%)
            foreach (var keyword in _commonKeywords)
            {
                if (content.ToLower().Contains(keyword.ToLower()))
                    score += 1;
            }

            // 2. Industry-Specific Keywords (20%)
            if (_industryKeywords.ContainsKey(industry))
            {
                foreach (var keyword in _industryKeywords[industry])
                {
                    if (content.ToLower().Contains(keyword.ToLower()))
                        score += 1;
                }
            }

            // 3. Formatting and Structure (20%)
            if (Regex.IsMatch(content, @"(?i)(experience|education|skills|projects)"))
                score += 10;
            if (Regex.IsMatch(content, @"(?i)(bullet|point|•|\*)", RegexOptions.Multiline))
                score += 10;

            // 4. Semantic Analysis (40%)
            var semanticAnalysis = await _openAiService.AnalyzeResumeAsync(content);
            score += semanticAnalysis.Score;

            // Normalize score (0-100)
            var normalizedScore = (score / 100) * 100;
            return Math.Max(0, Math.Min(100, normalizedScore));
        }
    }
}