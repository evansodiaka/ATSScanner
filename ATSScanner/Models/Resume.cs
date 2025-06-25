using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ATSScanner.Models
{
    public class Resume
    {
        public int Id { get; set; }

        [Required]
        public string FileName { get; set; }

        [Required]
        public string Content { get; set; }

        public DateTime UploadDate { get; set; }

        [Required]
        public int UserId { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public User User { get; set; }
        public ResumeAnalysis Analysis { get; set; }
    }
}
