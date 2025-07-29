using Microsoft.Extensions.Configuration;
using ATSScanner.Data;
using Microsoft.EntityFrameworkCore;
using Stripe;

// Services/PaymentService.cs
public class PaymentService
{
    private readonly IConfiguration _configuration;
    private readonly DataContext _context;

    public PaymentService(IConfiguration configuration, DataContext context)
    {
        _configuration = configuration;
        _context = context;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    public async Task<PaymentIntent> CreatePaymentIntentAsync(int userId, decimal amount)
    {
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(amount * 100), // Stripe uses cents
            Currency = "usd",
            Metadata = new Dictionary<string, string>
            {
                {"userId", userId.ToString()}
            }
        };

        var service = new PaymentIntentService();
        return await service.CreateAsync(options);
    }

    public async Task<Subscription> CreateSubscriptionAsync(int userId, string priceId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new ArgumentException("User not found", nameof(userId));
        }
        
        // Get plan details for proper description
        var plan = await _context.MembershipPlans.FirstOrDefaultAsync(p => p.StripePriceId == priceId);
        var planDescription = plan != null ? GetPlanDescription(plan.Name, plan.Price) : "ATSScanner Monthly Subscription";
        
        // Create customer if doesn't exist
        if (string.IsNullOrEmpty(user.StripeCustomerId))
        {
            var customerOptions = new CustomerCreateOptions
            {
                Email = user.Email,
                Name = user.Username,
                Description = $"ATSScanner customer for {user.Email}"
            };
            var customerService = new CustomerService();
            var customer = await customerService.CreateAsync(customerOptions);
            
            user.StripeCustomerId = customer.Id;
            await _context.SaveChangesAsync();
        }

        var options = new SubscriptionCreateOptions
        {
            Customer = user.StripeCustomerId,
            Items = new List<SubscriptionItemOptions>
            {
                new SubscriptionItemOptions { Price = priceId }
            },
            Metadata = new Dictionary<string, string>
            {
                {"userId", userId.ToString()},
                {"service", "ATSScanner Resume Analysis"},
                {"plan_type", "recurring_monthly"},
                {"plan_name", plan?.Name ?? "Unknown"},
                {"user_email", user.Email}
            },
            Description = planDescription
        };

        var service = new SubscriptionService();
        return await service.CreateAsync(options);
    }

    private string GetPlanDescription(string planName, decimal price)
    {
        return planName.ToLower() switch
        {
            "basic" => $"ATSScanner Basic Plan - Monthly Subscription ($${price:F2}/month) - Unlimited resume scans, AI analysis, ATS optimization, and advanced analytics dashboard. Recurring billing, cancel anytime.",
            "premium" => $"ATSScanner Premium Plan - Monthly Subscription ($${price:F2}/month) - Everything in Basic plus priority customer support and bulk resume upload processing. Recurring billing, cancel anytime.",
            _ => $"ATSScanner {planName} Plan - Monthly Subscription ($${price:F2}/month) - Unlimited resume scans and AI analysis with ATS optimization. Recurring billing, cancel anytime."
        };
    }

    public async Task<bool> CancelSubscriptionAsync(string subscriptionId)
    {
        try
        {
            var service = new SubscriptionService();
            var subscription = await service.CancelAsync(subscriptionId);
            return subscription.Status == "canceled";
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to cancel subscription: {ex.Message}");
        }
    }

    public async Task<Customer> GetCustomerAsync(string customerId)
    {
        var service = new CustomerService();
        return await service.GetAsync(customerId);
    }

    public async Task<List<PaymentMethod>> GetPaymentMethodsAsync(string customerId)
    {
        var service = new PaymentMethodService();
        var options = new PaymentMethodListOptions
        {
            Customer = customerId,
            Type = "card"
        };
        var paymentMethods = await service.ListAsync(options);
        return paymentMethods.Data.ToList();
    }
}