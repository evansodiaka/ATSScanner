using System.ComponentModel.DataAnnotations;

namespace ATSScanner.Models
{
    public class MembershipPlan
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } // Free, Basic, Premium, Enterprise

        [Required]
        public MembershipType Type { get; set; }

        [Required]
        public decimal Price { get; set; } // Monthly price

        [Required]
        public int ScanLimit { get; set; } // -1 for unlimited

        [Required]
        public bool IsActive { get; set; } = true;

        // Stripe price ID for this plan
        public string? StripePriceId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        // Plan features
        public bool HasPrioritySupport { get; set; } = false;
        public bool HasAdvancedAnalytics { get; set; } = false;
        public bool HasBulkUpload { get; set; } = false;
    }
} 