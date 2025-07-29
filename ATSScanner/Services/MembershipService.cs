using ATSScanner.Data;
using ATSScanner.Models;
using Microsoft.EntityFrameworkCore;

namespace ATSScanner.Services
{
    public class MembershipService
    {
        private readonly DataContext _context;
        private readonly ILogger<MembershipService> _logger;

        public MembershipService(DataContext context, ILogger<MembershipService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Check if unregistered user (by IP) can perform scan
        public async Task<UsageLimitResult> CheckUnregisteredUserLimitAsync(string ipAddress, int freeLimit = 3)
        {
            var usage = await _context.UsageTrackings
                .FirstOrDefaultAsync(u => u.IpAddress == ipAddress);

            if (usage == null)
            {
                // First time user
                return new UsageLimitResult
                {
                    CanScan = true,
                    RemainingScans = freeLimit - 1,
                    IsFirstTime = true
                };
            }

            // Check if reset period has passed
            if (DateTime.UtcNow > usage.ResetDate)
            {
                // Reset the counter
                usage.ScanCount = 0;
                usage.ResetDate = DateTime.UtcNow.AddMonths(1);
                await _context.SaveChangesAsync();
            }

            var remainingScans = freeLimit - usage.ScanCount;
            return new UsageLimitResult
            {
                CanScan = remainingScans > 0,
                RemainingScans = Math.Max(0, remainingScans - 1),
                IsFirstTime = false
            };
        }

        // Check if registered user can perform scan
        public async Task<UsageLimitResult> CheckRegisteredUserLimitAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Membership)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return new UsageLimitResult
                {
                    CanScan = false,
                    RemainingScans = 0,
                    ErrorMessage = "User not found"
                };
            }

            // Check if user has active membership
            if (user.Membership != null && user.Membership.IsActive)
            {
                // Check if membership is still valid
                if (user.Membership.EndDate == null || user.Membership.EndDate > DateTime.UtcNow)
                {
                    return new UsageLimitResult
                    {
                        CanScan = true,
                        RemainingScans = -1, // Unlimited
                        HasPaidMembership = true
                    };
                }
                else
                {
                    // Membership expired
                    user.Membership.IsActive = false;
                    await _context.SaveChangesAsync();
                }
            }

            // Free tier - 3 scans per day
            var freeLimit = 3;
            var remainingScans = freeLimit - user.ScanCount;
            
            return new UsageLimitResult
            {
                CanScan = remainingScans > 0,
                RemainingScans = Math.Max(0, remainingScans - 1),
                HasPaidMembership = false
            };
        }

        // Record a scan for unregistered user
        public async Task RecordUnregisteredScanAsync(string ipAddress)
        {
            var usage = await _context.UsageTrackings
                .FirstOrDefaultAsync(u => u.IpAddress == ipAddress);

            if (usage == null)
            {
                usage = new UsageTracking
                {
                    IpAddress = ipAddress,
                    ScanCount = 1,
                    FirstScanDate = DateTime.UtcNow,
                    LastScanDate = DateTime.UtcNow,
                    ResetDate = DateTime.UtcNow.AddMonths(1)
                };
                _context.UsageTrackings.Add(usage);
            }
            else
            {
                usage.ScanCount++;
                usage.LastScanDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        // Record a scan for registered user
        public async Task RecordRegisteredScanAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Membership)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user != null)
            {
                // Only increment scan count if user doesn't have active paid membership
                if (user.Membership == null || !user.Membership.IsActive)
                {
                    user.ScanCount++;
                }
                user.LastScanDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        // Get membership plans
        public async Task<List<MembershipPlan>> GetMembershipPlansAsync()
        {
            return await _context.MembershipPlans
                .Where(p => p.IsActive)
                .OrderBy(p => p.Price)
                .ToListAsync();
        }

        // Get user's current membership status
        public async Task<UserMembershipStatus> GetUserMembershipStatusAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Membership)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return new UserMembershipStatus { IsValid = false };
            }

            var status = new UserMembershipStatus
            {
                IsValid = true,
                UserId = userId,
                ScanCount = user.ScanCount,
                LastScanDate = user.LastScanDate,
                HasActiveMembership = user.Membership?.IsActive == true
            };

            if (user.Membership?.IsActive == true)
            {
                status.MembershipType = user.Membership.Type;
                status.StartDate = user.Membership.StartDate;
                status.EndDate = user.Membership.EndDate;
                status.RemainingScans = -1; // Unlimited
            }
            else
            {
                status.MembershipType = MembershipType.Free;
                status.RemainingScans = Math.Max(0, 3 - user.ScanCount);
            }

            return status;
        }
    }

    // Result classes
    public class UsageLimitResult
    {
        public bool CanScan { get; set; }
        public int RemainingScans { get; set; }
        public bool IsFirstTime { get; set; }
        public bool HasPaidMembership { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class UserMembershipStatus
    {
        public bool IsValid { get; set; }
        public int UserId { get; set; }
        public int ScanCount { get; set; }
        public DateTime? LastScanDate { get; set; }
        public bool HasActiveMembership { get; set; }
        public MembershipType MembershipType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int RemainingScans { get; set; }
    }
} 