namespace ATSScanner.Models
{
    public class UserProfileDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Bio { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public DateTime LastUpdated { get; set; }
        
        // Subscription info
        public UserSubscriptionDto? Subscription { get; set; }
        
        // Usage statistics
        public int ScanCount { get; set; }
        public DateTime? LastScanDate { get; set; }
    }

    public class UserSubscriptionDto
    {
        public string PlanName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int ScanLimit { get; set; }
        public int ScansUsed { get; set; }
        public int ScansRemaining { get; set; }
        public bool IsActive { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? StripeSubscriptionId { get; set; }
        public bool CanCancel { get; set; }
    }

    public class UpdateUserProfileDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Bio { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }
}