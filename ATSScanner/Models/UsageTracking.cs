using System.ComponentModel.DataAnnotations;

namespace ATSScanner.Models
{
    public class UsageTracking
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(45)] // IPv6 max length
        public string IpAddress { get; set; }

        [Required]
        public int ScanCount { get; set; } = 0;

        public DateTime FirstScanDate { get; set; } = DateTime.UtcNow;
        public DateTime LastScanDate { get; set; } = DateTime.UtcNow;

        // Reset period (monthly)
        public DateTime ResetDate { get; set; } = DateTime.UtcNow.AddMonths(1);
    }
} 