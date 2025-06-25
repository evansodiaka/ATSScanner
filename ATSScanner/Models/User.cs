using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ATSScanner.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public DateTime DateCreated { get; set; } = DateTime.UtcNow;

        // Navigation property
        public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    }
} 