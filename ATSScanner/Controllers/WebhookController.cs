using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ATSScanner.Data;
using ATSScanner.Models;
using Stripe;

namespace ATSScanner.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WebhookController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly DataContext _context;
        private readonly ILogger<WebhookController> _logger;

        public WebhookController(IConfiguration configuration, DataContext context, ILogger<WebhookController> logger)
        {
            _configuration = configuration;
            _context = context;
            _logger = logger;
        }

        [HttpPost("stripe")]
        public async Task<IActionResult> HandleStripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var endpointSecret = _configuration["Stripe:WebhookSecret"];

            if (string.IsNullOrEmpty(endpointSecret))
            {
                _logger.LogWarning("Stripe webhook secret not configured");
                return BadRequest("Webhook secret not configured");
            }

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json, 
                    Request.Headers["Stripe-Signature"], 
                    endpointSecret
                );

                _logger.LogInformation($"Processing Stripe webhook event: {stripeEvent.Type}");

                switch (stripeEvent.Type)
                {
                    case "customer.subscription.created":
                        await HandleSubscriptionCreated(stripeEvent);
                        break;
                    case "customer.subscription.updated":
                        await HandleSubscriptionUpdated(stripeEvent);
                        break;
                    case "customer.subscription.deleted":
                        await HandleSubscriptionDeleted(stripeEvent);
                        break;
                    case "invoice.payment_succeeded":
                        await HandlePaymentSucceeded(stripeEvent);
                        break;
                    case "invoice.payment_failed":
                        await HandlePaymentFailed(stripeEvent);
                        break;
                    default:
                        _logger.LogInformation($"Unhandled webhook event: {stripeEvent.Type}");
                        break;
                }

                return Ok();
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe webhook error: {Message}", ex.Message);
                return BadRequest($"Webhook error: {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "General webhook error: {Message}", ex.Message);
                return StatusCode(500, "Internal server error");
            }
        }

        private async Task HandleSubscriptionCreated(Event stripeEvent)
        {
            var subscription = stripeEvent.Data.Object as Subscription;
            if (subscription?.Metadata?.ContainsKey("userId") == true)
            {
                var userId = int.Parse(subscription.Metadata["userId"]);
                var membership = await _context.Memberships
                    .FirstOrDefaultAsync(m => m.UserId == userId && m.StripeSubscriptionId == subscription.Id);
                
                if (membership != null)
                {
                    membership.IsActive = subscription.Status == "active";
                    membership.UpdatedDate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Updated membership {membership.Id} for subscription created");
                }
            }
        }

        private async Task HandleSubscriptionUpdated(Event stripeEvent)
        {
            var subscription = stripeEvent.Data.Object as Subscription;
            var membership = await _context.Memberships
                .FirstOrDefaultAsync(m => m.StripeSubscriptionId == subscription.Id);
            
            if (membership != null)
            {
                membership.IsActive = subscription.Status == "active";
                membership.UpdatedDate = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Updated membership {membership.Id} for subscription updated");
            }
        }

        private async Task HandleSubscriptionDeleted(Event stripeEvent)
        {
            var subscription = stripeEvent.Data.Object as Subscription;
            var membership = await _context.Memberships
                .FirstOrDefaultAsync(m => m.StripeSubscriptionId == subscription.Id);
            
            if (membership != null)
            {
                membership.IsActive = false;
                membership.EndDate = DateTime.UtcNow;
                membership.UpdatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Deactivated membership {membership.Id} for subscription deleted");
            }
        }

        private async Task HandlePaymentSucceeded(Event stripeEvent)
        {
            var invoice = stripeEvent.Data.Object as Invoice;
            _logger.LogInformation($"Payment succeeded for invoice {invoice?.Id}");
            
            // For now, we'll rely on subscription events for membership management
            // This can be enhanced later when we need detailed invoice handling
        }

        private async Task HandlePaymentFailed(Event stripeEvent)
        {
            var invoice = stripeEvent.Data.Object as Invoice;
            _logger.LogWarning($"Payment failed for invoice {invoice?.Id}");
            
            // For now, we'll rely on subscription events for membership management
            // This can be enhanced later when we need detailed failed payment handling
        }
    }
} 