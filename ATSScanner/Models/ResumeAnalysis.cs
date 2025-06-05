using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ATSScanner.Models
{
    public class ResumeAnalysis
    {
        public int Id { get; set; }

        [Required]
        public int ResumeId { get; set; }

        [Required]
        public double AtsScore { get; set; } // Traditional ATS scoring

        [Required]
        public double AiScore { get; set; } // AI-powered analysis score

        [Required]
        public string Feedback { get; set; } // Detailed analysis feedback

        // Navigation property
        [ForeignKey("ResumeId")]
        public Resume Resume { get; set; }
    }
}
