# 🔗 Webhook Setup Guide (No Domain Required)

## 🚀 **Option 1: Stripe CLI (Recommended for Development)**

### **Step 1: Install Stripe CLI**

**Windows (PowerShell):**
```powershell
# Download and install Stripe CLI
scoop install stripe
# OR download from: https://github.com/stripe/stripe-cli/releases
```

**Alternative Windows Installation:**
1. Go to https://github.com/stripe/stripe-cli/releases
2. Download `stripe_X.X.X_windows_x86_64.zip`
3. Extract and add to your PATH

### **Step 2: Login to Stripe**
```bash
stripe login
# This will open your browser to authenticate with Stripe
```

### **Step 3: Start Your Backend Server**
```bash
# In your ATSScanner directory
cd ATSScanner
dotnet run
# Your API should be running on https://localhost:5001 or similar
```

### **Step 4: Forward Webhooks to Your Local Server**
```bash
# In a new terminal/PowerShell window
stripe listen --forward-to localhost:5001/api/webhook/stripe

# This will output something like:
# > Ready! Your webhook signing secret is whsec_1234567890abcdef...
# > Forwarding events to localhost:5001/api/webhook/stripe
```

### **Step 5: Update Your appsettings.json**
Copy the webhook secret from Step 4 and update your config:

```json
{
  "Stripe": {
    "SecretKey": "sk_test_51RkXwOPNK7jJq4OFQdsdcp6n4IGWUUrvPIgDFZGDQkyHNadkuk9oVVmp7lzVcN8GenDs9lR7xG6ErWXpBqXZ11cU00uNWeOdvw",
    "PublishableKey": "pk_test_51RkXwOPNK7jJq4OFWfkoLxqVAha8lbr00F9S38V90YjbEtsqdN8uW1Rm85Jz2ASJMUIFIPIt36qkxpewetUmsos700ztLgCcFv",
    "WebhookSecret": "whsec_YOUR_WEBHOOK_SECRET_FROM_STEP_4"
  }
}
```

### **Step 6: Test Webhook Events**
```bash
# In another terminal, trigger test events:
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed

# You should see webhook events in your application logs!
```

---

## 🌐 **Option 2: ngrok (Alternative)**

### **Step 1: Install ngrok**
```bash
# Download from https://ngrok.com/download
# Or use chocolatey: choco install ngrok
```

### **Step 2: Expose Your Local Server**
```bash
# Start your .NET API first
cd ATSScanner && dotnet run

# In new terminal, expose port 5001
ngrok http 5001
# This gives you a public URL like: https://abc123.ngrok.io
```

### **Step 3: Configure Stripe Dashboard**
1. Go to **Stripe Dashboard** → **Webhooks** → **Add endpoint**
2. Set URL: `https://abc123.ngrok.io/api/webhook/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret and update `appsettings.json`

---

## ✅ **Recommended Development Workflow**

### **For Local Development (Use Stripe CLI):**
```bash
# Terminal 1: Start your API
cd ATSScanner
dotnet run

# Terminal 2: Forward webhooks
stripe listen --forward-to localhost:5001/api/webhook/stripe

# Terminal 3: Test your app
cd client
npm start
```

### **Benefits of Stripe CLI:**
- ✅ **No public URLs needed**
- ✅ **Automatic webhook secret management**
- ✅ **Real-time event forwarding**
- ✅ **Built-in event testing**
- ✅ **Secure tunnel to localhost**
- ✅ **Perfect for development**

---

## 🔍 **Testing Your Webhook Setup**

### **Test 1: Subscription Created**
```bash
stripe trigger customer.subscription.created
```
**Expected**: Your `WebhookController` logs "Updated membership X for subscription created"

### **Test 2: Payment Processing**
1. Go to your React app
2. Try to upgrade to Basic plan
3. Use test card: `4242424242424242`
4. **Expected**: Webhook events fire and membership activates

### **Test 3: Failed Payment**
```bash
stripe trigger invoice.payment_failed
```
**Expected**: Webhook logs payment failure warning

---

## 🚀 **Production Deployment (Later)**

When you deploy to production:

1. **Get your domain**: `https://yourdomain.com`
2. **Update webhook URL**: `https://yourdomain.com/api/webhook/stripe`
3. **Use production webhook secret**
4. **Switch to live Stripe keys**

---

## 📝 **Quick Start Commands**

```bash
# 1. Install Stripe CLI
scoop install stripe

# 2. Login to Stripe
stripe login

# 3. Start your API (Terminal 1)
cd ATSScanner && dotnet run

# 4. Forward webhooks (Terminal 2)
stripe listen --forward-to localhost:5001/api/webhook/stripe

# 5. Update appsettings.json with the webhook secret from step 4

# 6. Test it works
stripe trigger customer.subscription.created
```

**You're now ready to test payments with full webhook support!** 🎉 