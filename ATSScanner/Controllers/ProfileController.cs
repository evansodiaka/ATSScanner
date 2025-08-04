using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ATSScanner.Data;
using ATSScanner.Models;
using ATSScanner.Services;
using System.Security.Claims;

namespace ATSScanner.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly PaymentService _paymentService;

        public ProfileController(DataContext context, PaymentService paymentService)
        {
            _context = context;
            _paymentService = paymentService;
        }

        [HttpGet]
        public async Task<ActionResult<UserProfileDto>> GetProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var user = await _context.Users
                .Include(u => u.Membership)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return NotFound();

            var userProfile = await _context.UserProfiles
                .FirstOrDefaultAsync(up => up.UserId == userId);

            // Get membership plan details if user has active membership
            UserSubscriptionDto? subscriptionDto = null;
            if (user.Membership != null)
            {
                var membershipPlan = await _context.MembershipPlans
                    .FirstOrDefaultAsync(mp => mp.StripePriceId == user.Membership.StripePriceId);

                if (membershipPlan != null)
                {
                    var scansUsed = user.ScanCount;
                    subscriptionDto = new UserSubscriptionDto
                    {
                        PlanName = membershipPlan.Name,
                        Type = user.Membership.Type.ToString(),
                        Price = membershipPlan.Price,
                        ScanLimit = membershipPlan.ScanLimit,
                        ScansUsed = scansUsed,
                        ScansRemaining = Math.Max(0, membershipPlan.ScanLimit - scansUsed),
                        IsActive = user.Membership.IsActive,
                        StartDate = user.Membership.StartDate,
                        EndDate = user.Membership.EndDate,
                        StripeSubscriptionId = user.Membership.StripeSubscriptionId,
                        CanCancel = !string.IsNullOrEmpty(user.Membership.StripeSubscriptionId)
                    };
                }
            }

            var profileDto = new UserProfileDto
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = userProfile?.FirstName,
                LastName = userProfile?.LastName,
                PhoneNumber = userProfile?.PhoneNumber,
                Bio = userProfile?.Bio,
                DateOfBirth = userProfile?.DateOfBirth,
                LastUpdated = userProfile?.LastUpdated ?? user.DateCreated,
                Subscription = subscriptionDto,
                ScanCount = user.ScanCount,
                LastScanDate = user.LastScanDate
            };

            return Ok(profileDto);
        }

        [HttpPut]
        public async Task<ActionResult<UserProfileDto>> UpdateProfile(UpdateUserProfileDto updateDto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var userProfile = await _context.UserProfiles
                .FirstOrDefaultAsync(up => up.UserId == userId);

            if (userProfile == null)
            {
                // Create new profile if doesn't exist
                userProfile = new UserProfile
                {
                    UserId = userId.Value,
                    FirstName = updateDto.FirstName,
                    LastName = updateDto.LastName,
                    PhoneNumber = updateDto.PhoneNumber,
                    Bio = updateDto.Bio,
                    DateOfBirth = updateDto.DateOfBirth,
                    LastUpdated = DateTime.UtcNow
                };
                _context.UserProfiles.Add(userProfile);
            }
            else
            {
                // Update existing profile
                userProfile.FirstName = updateDto.FirstName;
                userProfile.LastName = updateDto.LastName;
                userProfile.PhoneNumber = updateDto.PhoneNumber;
                userProfile.Bio = updateDto.Bio;
                userProfile.DateOfBirth = updateDto.DateOfBirth;
                userProfile.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Return updated profile
            return await GetProfile();
        }

        [HttpPost("cancel-subscription")]
        public async Task<IActionResult> CancelSubscription()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var user = await _context.Users
                .Include(u => u.Membership)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.Membership == null)
                return BadRequest("No active subscription found");

            if (string.IsNullOrEmpty(user.Membership.StripeSubscriptionId))
                return BadRequest("Cannot cancel subscription - no Stripe subscription ID");

            try
            {
                // Cancel subscription in Stripe
                await _paymentService.CancelSubscriptionAsync(user.Membership.StripeSubscriptionId);

                // Update membership status
                user.Membership.IsActive = false;
                user.Membership.UpdatedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Subscription cancelled successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest($"Failed to cancel subscription: {ex.Message}");
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }
}