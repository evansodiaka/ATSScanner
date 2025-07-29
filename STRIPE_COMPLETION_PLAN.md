# Stripe Payment Integration Completion Plan

## 🎯 **Priority Order for MVP Launch**

### **Phase 1: Stripe Dashboard Setup (1-2 hours)**
**Must be completed FIRST before any code changes**

#### 1.1 Create Stripe Products & Prices
```bash
# Login to Stripe Dashboard (https://dashboard.stripe.com)
# Navigate to Products → Create Product

# Product 1: ATSScanner Basic
Name: "ATSScanner Basic Plan"
Description: "Monthly subscription with unlimited resume scans and AI analysis"
Price: $9.99/month (recurring)
→ Copy the Price ID (e.g., price_1ABC123...)

# Product 2: ATSScanner Premium  
Name: "ATSScanner Premium Plan"
Description: "Monthly subscription with unlimited scans, priority support, and bulk upload"
Price: $19.99/month (recurring)
→ Copy the Price ID (e.g., price_1XYZ789...)
```

#### 1.2 Configure Webhook Endpoint
```bash
# In Stripe Dashboard → Webhooks → Add endpoint
Endpoint URL: https://your-domain.com/api/webhook/stripe
Events to send:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
- customer.subscription.trial_will_end

→ Copy the Webhook Signing Secret (whsec_...)
```

### **Phase 2: Backend Code Implementation (3-4 hours)**

#### 2.1 Update Configuration
```csharp
// appsettings.json - Add webhook secret
{
  "Stripe": {
    "SecretKey": "sk_test_...",
    "PublishableKey": "pk_test_...",
    "WebhookSecret": "whsec_..." // ADD THIS
  }
}
```

#### 2.2 Update MembershipPlan Seeding
```csharp
// In Program.cs - Replace placeholder Price IDs with real ones
new MembershipPlan
{
    Name = "Basic",
    Type = MembershipType.Basic,
    Price = 9.99m,
    ScanLimit = -1,
    IsActive = true,
    HasAdvancedAnalytics = true,
    StripePriceId = "price_1ABC123..." // REAL STRIPE PRICE ID
},
new MembershipPlan
{
    Name = "Premium", 
    Type = MembershipType.Premium,
    Price = 19.99m,
    ScanLimit = -1,
    IsActive = true,
    HasPrioritySupport = true,
    HasAdvancedAnalytics = true,
    HasBulkUpload = true,
    StripePriceId = "price_1XYZ789..." // REAL STRIPE PRICE ID
}
```

#### 2.3 Create Webhook Controller
```csharp
// ATSScanner/Controllers/WebhookController.cs
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

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                json, 
                Request.Headers["Stripe-Signature"], 
                endpointSecret
            );

            switch (stripeEvent.Type)
            {
                case Events.CustomerSubscriptionCreated:
                    await HandleSubscriptionCreated(stripeEvent);
                    break;
                case Events.CustomerSubscriptionUpdated:
                    await HandleSubscriptionUpdated(stripeEvent);
                    break;
                case Events.CustomerSubscriptionDeleted:
                    await HandleSubscriptionDeleted(stripeEvent);
                    break;
                case Events.InvoicePaymentSucceeded:
                    await HandlePaymentSucceeded(stripeEvent);
                    break;
                case Events.InvoicePaymentFailed:
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
            _logger.LogError(ex, "Stripe webhook error");
            return BadRequest();
        }
    }

    private async Task HandleSubscriptionCreated(Event stripeEvent)
    {
        var subscription = stripeEvent.Data.Object as Subscription;
        // Update membership status in database
        var userId = int.Parse(subscription.Metadata["userId"]);
        var membership = await _context.Memberships
            .FirstOrDefaultAsync(m => m.UserId == userId && m.StripeSubscriptionId == subscription.Id);
        
        if (membership != null)
        {
            membership.IsActive = subscription.Status == "active";
            membership.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
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
        }
    }

    // Additional webhook handlers...
}
```

#### 2.4 Enhance PaymentService
```csharp
// Add to PaymentService.cs
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
```

#### 2.5 Fix PaymentController
```csharp
// Update cancel-subscription endpoint
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

// Add payment methods endpoint
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
```

### **Phase 3: Frontend Enhancements (2-3 hours)**

#### 3.1 Add Subscription Management Component
```typescript
// client/src/components/SubscriptionManagement.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Alert } from '@mui/material';
import paymentService from '../services/paymentService';

interface SubscriptionData {
  isActive: boolean;
  planName: string;
  nextBillingDate: string;
  amount: number;
}

const SubscriptionManagement: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
    fetchPaymentMethods();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const status = await paymentService.getSubscriptionStatus();
      setSubscription(status);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods.paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await paymentService.cancelSubscription();
        await fetchSubscriptionData();
        alert('Subscription cancelled successfully');
      } catch (error) {
        alert('Error cancelling subscription');
      }
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Subscription Management
        </Typography>
        
        {subscription?.isActive ? (
          <div>
            <Typography>Plan: {subscription.planName}</Typography>
            <Typography>Next billing: {subscription.nextBillingDate}</Typography>
            <Typography>Amount: ${subscription.amount}/month</Typography>
            <Button 
              color="error" 
              onClick={handleCancelSubscription}
              sx={{ mt: 2 }}
            >
              Cancel Subscription
            </Button>
          </div>
        ) : (
          <Typography>No active subscription</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionManagement;
```

#### 3.2 Update paymentService.ts
```typescript
// Add to client/src/services/paymentService.ts
getPaymentMethods: async () => {
  const token = authService.getCurrentUser()?.token;
  const response = await axios.get(`${API_URL}/payment/payment-methods`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
},

cancelSubscription: async () => {
  const token = authService.getCurrentUser()?.token;
  const response = await axios.post(`${API_URL}/payment/cancel-subscription`, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
}
```

### **Phase 4: Testing & Validation (1-2 hours)**

#### 4.1 Test Payment Flows
```bash
# Test Cases to Complete:
1. ✅ Free user signup and 3 scan limit
2. ✅ Payment intent creation
3. ✅ Successful payment and subscription activation
4. ✅ Webhook handling (use Stripe CLI for testing)
5. ✅ Subscription cancellation
6. ✅ Failed payment handling
7. ✅ Customer portal access
```

#### 4.2 Stripe CLI Testing
```bash
# Install Stripe CLI and forward webhooks to local development
stripe login
stripe listen --forward-to localhost:7291/api/webhook/stripe

# Test webhook events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_failed
```

## 🚨 **Critical Issues to Fix**

### 1. **Database Migration Required**
```bash
# Run this after updating membership plans
cd ATSScanner
dotnet ef migrations add UpdateStripePriceIds
dotnet ef database update
```

### 2. **Environment Variables**
```bash
# Add to production environment
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 3. **CORS Configuration**
```csharp
// Update Program.cs for webhook endpoint
app.UseCors(options => 
{
    options.WithOrigins("https://js.stripe.com")
           .AllowAnyMethod()
           .AllowAnyHeader();
});
```

## 📋 **MVP Payment Checklist**

### **Before Launch:**
- [ ] Create real Stripe products and prices
- [ ] Update database with real Stripe Price IDs
- [ ] Implement webhook handling
- [ ] Test end-to-end payment flow
- [ ] Test subscription cancellation
- [ ] Test failed payment scenarios
- [ ] Verify webhook security (signature validation)

### **Post-Launch Enhancements:**
- [ ] Customer portal integration
- [ ] Proration handling for plan changes
- [ ] Dunning management for failed payments
- [ ] Subscription analytics dashboard
- [ ] Invoice customization
- [ ] Multiple payment methods support

## ⏰ **Implementation Timeline**

- **Day 1 (2-3 hours)**: Stripe Dashboard setup + Real Price IDs
- **Day 2 (4-5 hours)**: Backend webhook implementation + testing
- **Day 3 (3-4 hours)**: Frontend subscription management + testing
- **Day 4 (1-2 hours)**: End-to-end testing + bug fixes

**Total: 10-14 hours to complete Stripe integration**

## 💡 **Next Steps**

1. **Start with Stripe Dashboard setup** - This MUST be done first
2. **Get real Price IDs** and update your codebase
3. **Implement webhook handling** for production reliability
4. **Test everything thoroughly** before going live

Would you like me to help implement any specific part of this plan? 