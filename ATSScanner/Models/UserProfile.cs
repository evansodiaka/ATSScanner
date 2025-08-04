using System.ComponentModel.DataAnnotations;

namespace ATSScanner.Models
{
    public class UserProfile
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [StringLength(50)]
        public string? FirstName { get; set; }
        
        [StringLength(50)]
        public string? LastName { get; set; }
        
        [StringLength(20)]
        public string? PhoneNumber { get; set; }
        
        [StringLength(500)]
        public string? Bio { get; set; }
        
        public DateTime? DateOfBirth { get; set; }
        
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public User User { get; set; } = null!;
    }
}