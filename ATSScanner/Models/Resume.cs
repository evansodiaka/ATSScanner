using System;
using System.ComponentModel.DataAnnotations;

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

        // Navigation property
        public ResumeAnalysis Analysis { get; set; }
    }
}
