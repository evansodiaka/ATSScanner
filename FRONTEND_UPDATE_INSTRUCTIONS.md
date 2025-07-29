# 📝 **Frontend Configuration for Azure**

## 🔄 **After Your Backend Deploys Successfully**

### **Step 1: Get Your Azure App Service URL**
Once Visual Studio completes deployment, you'll see something like:
```
https://atsscanner-api-yourname.azurewebsites.net
```

### **Step 2: Update Frontend Service Files**

Replace `YOUR_AZURE_APP_NAME` in these files with your actual app name:

#### **client/src/services/authService.ts**
```typescript
const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://atsscanner-api-YOURNAME.azurewebsites.net/api/auth"  // ← Update this
  : "https://localhost:7291/api/auth";
```

#### **client/src/services/paymentService.ts**
```typescript
const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://atsscanner-api-YOURNAME.azurewebsites.net/api"  // ← Update this
  : "https://localhost:7291/api";
```

#### **client/src/services/resumeService.ts**
```typescript
const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://atsscanner-api-YOURNAME.azurewebsites.net/api/resume"  // ← Update this
  : "https://localhost:7291/api/resume";
```

### **Step 3: Build React App for Production**
```bash
cd client
npm run build
```

### **Step 4: Deploy to Azure Static Web Apps**
1. **Go to Azure Portal** → **Create Resource** → **Static Web Apps**
2. **Choose "Other"** as source
3. **Upload your `build` folder**
4. **Configure custom domain** (optional)

### **Step 5: Configure App Service Settings**
In **Azure Portal** → **Your App Service** → **Configuration**:

Add these **Application Settings**:
```
Stripe__SecretKey = sk_live_YOUR_LIVE_KEY
Stripe__PublishableKey = pk_live_YOUR_LIVE_KEY  
Stripe__WebhookSecret = whsec_YOUR_WEBHOOK_SECRET
JWT__SecretKey = YOUR_32_CHAR_SECRET
OpenAI__ApiKey = YOUR_OPENAI_KEY
```

### **Step 6: Update Stripe Webhook URL**
In **Stripe Dashboard** → **Webhooks**:
```
New URL: https://atsscanner-api-YOURNAME.azurewebsites.net/api/webhook/stripe
```

## ✅ **Verification Checklist**
- [ ] Backend deployed and running
- [ ] Database created and connected
- [ ] Frontend built and deployed
- [ ] API URLs updated
- [ ] Stripe webhook configured
- [ ] Payment flow tested

**Your app will be live at:**
- **Backend API**: `https://atsscanner-api-YOURNAME.azurewebsites.net`
- **Frontend**: `https://YOURNAME.azurestaticapps.net`

## 🎉 **Ready to Accept Customers!** 