using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ATSScanner.Models
{
    public enum MembershipType
    {
        Free = 0,
        Basic = 1,
        Premium = 2,
        Enterprise = 3
    }

    public class Membership
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public MembershipType Type { get; set; } = MembershipType.Free;

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [Required]
        public bool IsActive { get; set; } = false;

        // Stripe subscription details
        public string? StripeSubscriptionId { get; set; }
        public string? StripePriceId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedDate { get; set; }

        // Navigation property
        [ForeignKey("UserId")]
        public User User { get; set; }
    }
} 