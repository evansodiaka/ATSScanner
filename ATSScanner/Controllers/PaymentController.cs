using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ATSScanner.Models;
using ATSScanner.Services;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using ATSScanner.Data;

namespace ATSScanner.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;
        private readonly MembershipService _membershipService;
        private readonly DataContext _context;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(
            PaymentService paymentService,
            MembershipService membershipService,
            DataContext context,
            ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _membershipService = membershipService;
            _context = context;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User ID not found in token");
        }

        [HttpGet("membership-plans")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMembershipPlans()
        {
            try
            {
                var plans = await _membershipService.GetMembershipPlansAsync();
                return Ok(plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching membership plans");
                return StatusCode(500, "Error fetching membership plans");
            }
        }

        [HttpPost("create-payment-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Validate the plan exists
                var plan = await _context.MembershipPlans.FindAsync(request.PlanId);
                if (plan == null || !plan.IsActive)
                {
                    return BadRequest("Invalid membership plan");
                }

                // Create payment intent
                var paymentIntent = await _paymentService.CreatePaymentIntentAsync(userId, plan.Price);

                return Ok(new
                {
                    clientSecret = paymentIntent.ClientSecret,
                    paymentIntentId = paymentIntent.Id,
                    planId = plan.Id,
                    amount = plan.Price
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment intent");
                return StatusCode(500, "Error creating payment intent");
            }
        }

        [HttpPost("create-subscription")]
        public async Task<IActionResult> CreateSubscription([FromBody] CreateSubscriptionRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Validate the plan exists
                var plan = await _context.MembershipPlans.FindAsync(request.PlanId);
                if (plan == null || !plan.IsActive || string.IsNullOrEmpty(plan.StripePriceId))
                {
                    return BadRequest("Invalid membership plan or missing Stripe price ID");
                }

                // Check if user already has an active subscription
                var existingMembership = await _context.Memberships
                    .FirstOrDefaultAsync(m => m.UserId == userId && m.IsActive);
                
                if (existingMembership != null)
                {
                    return BadRequest("User already has an active subscription");
                }

                // Create subscription
                var subscription = await _paymentService.CreateSubscriptionAsync(userId, plan.StripePriceId);

                // Create membership record
                var membership = new Membership
                {
                    UserId = userId,
                    Type = plan.Type,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(1), // Monthly subscription
                    IsActive = true,
                    StripeSubscriptionId = subscription.Id,
                    StripePriceId = plan.StripePriceId,
                    CreatedDate = DateTime.UtcNow
                };

                _context.Memberships.Add(membership);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    subscriptionId = subscription.Id,
                    membershipId = membership.Id,
                    status = subscription.Status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription");
                return StatusCode(500, "Error creating subscription");
            }
        }

        [HttpPost("confirm-payment")]
        public async Task<IActionResult> ConfirmPayment([FromBody] ConfirmPaymentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Validate the plan exists
                var plan = await _context.MembershipPlans.FindAsync(request.PlanId);
                if (plan == null || !plan.IsActive)
                {
                    return BadRequest("Invalid membership plan");
                }

                // Check if user already has an active subscription
                var existingMembership = await _context.Memberships
                    .FirstOrDefaultAsync(m => m.UserId == userId && m.IsActive);
                
                if (existingMembership != null)
                {
                    return BadRequest("User already has an active subscription");
                }

                // Create membership record for one-time payment
                var membership = new Membership
                {
                    UserId = userId,
                    Type = plan.Type,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddMonths(1), // One month access
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow
                };

                _context.Memberships.Add(membership);
                
                // Reset user's scan count since they now have paid membership
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.ScanCount = 0;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    membershipId = membership.Id,
                    message = "Payment confirmed and membership activated"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming payment");
                return StatusCode(500, "Error confirming payment");
            }
        }

        [HttpGet("subscription-status")]
        public async Task<IActionResult> GetSubscriptionStatus()
        {
            try
            {
                var userId = GetCurrentUserId();
                var status = await _membershipService.GetUserMembershipStatusAsync(userId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching subscription status");
                return StatusCode(500, "Error fetching subscription status");
            }
        }

        [HttpPost("cancel-subscription")]
        public async Task<IActionResult> CancelSubscription()
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var membership = await _context.Memberships
                    .FirstOrDefaultAsync(m => m.UserId == userId && m.IsActive);
                
                if (membership == null)
                {
                    return NotFound("No active subscription found");
                }

                // Cancel in Stripe first
                if (!string.IsNullOrEmpty(membership.StripeSubscriptionId))
                {
                    var cancelled = await _paymentService.CancelSubscriptionAsync(membership.StripeSubscriptionId);
                    if (!cancelled)
                    {
                        return StatusCode(500, "Failed to cancel subscription with Stripe");
                    }
                }

                // Update local database
                membership.IsActive = false;
                membership.EndDate = DateTime.UtcNow;
                membership.UpdatedDate = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                return Ok(new { message = "Subscription cancelled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling subscription");
                return StatusCode(500, "Error cancelling subscription");
            }
        }

        [HttpGet("payment-methods")]  
        public async Task<IActionResult> GetPaymentMethods()
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _context.Users.FindAsync(userId);
                
                if (user == null || string.IsNullOrEmpty(user.StripeCustomerId))
                {
                    return Ok(new { paymentMethods = new List<object>() });
                }

                var paymentMethods = await _paymentService.GetPaymentMethodsAsync(user.StripeCustomerId);
                
                return Ok(new { 
                    paymentMethods = paymentMethods.Select(pm => new {
                        id = pm.Id,
                        brand = pm.Card.Brand,
                        last4 = pm.Card.Last4,
                        expMonth = pm.Card.ExpMonth,
                        expYear = pm.Card.ExpYear
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching payment methods");
                return StatusCode(500, "Error fetching payment methods");
            }
        }
    }

    // Request/Response DTOs
    public class CreatePaymentIntentRequest
    {
        public int PlanId { get; set; }
    }

    public class CreateSubscriptionRequest
    {
        public int PlanId { get; set; }
    }

    public class ConfirmPaymentRequest
    {
        public int PlanId { get; set; }
        public string? PaymentIntentId { get; set; }
    }
} 