# 🚀 **Frontend Deployment Guide**

## 📍 **Current Setup**
- **Frontend Location**: `C:\Users\evans.odiaka\source\repos\ATSScanner\client`
- **Backend URL**: `https://atsscanner-personal-server.azurewebsites.net`

---

## 🔧 **Step 1: Update API URLs in Your Frontend**

### **Files to Update:**

#### **1. authService.ts**
```typescript
// client/src/services/authService.ts (around line 4-6)
const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://atsscanner-personal-server.azurewebsites.net/api/auth"
  : "https://localhost:7291/api/auth";
```

#### **2. resumeService.ts**
```typescript
// client/src/services/resumeService.ts (around line 4-6)
const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://atsscanner-personal-server.azurewebsites.net/api/resume"
  : "https://localhost:7291/api/resume";
```

#### **3. paymentService.ts**
```typescript
// client/src/services/paymentService.ts (around line 4-6)
const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://atsscanner-personal-server.azurewebsites.net/api/payment"
  : "https://localhost:7291/api/payment";
```

#### **4. profileService.ts** (Already updated)
```typescript
// client/src/services/profileService.ts (around line 4-6)
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://atsscanner-personal-server.azurewebsites.net/api/profile'
  : 'https://localhost:7291/api/profile';
```

---

## 🚀 **Step 2: Deploy to Azure Static Web Apps**

### **In PowerShell at:** `C:\Users\evans.odiaka\source\repos\ATSScanner\client>`

#### **1. Install Dependencies & Build**
```powershell
# Install additional packages if needed
npm install axios react-router-dom @mui/material @emotion/react @emotion/styled

# Build for production
npm run build
```

#### **2. Install Azure CLI & Static Web Apps CLI**
```powershell
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Login to Azure (if not already)
az login
```

#### **3. Deploy Options**

##### **Option A: GitHub Integration (Recommended)**
```powershell
# Create Static Web App with GitHub integration
az staticwebapp create \
  --name 'atsscanner-frontend' \
  --resource-group 'DefaultResourceGroup-EUS' \
  --source 'https://github.com/yourusername/ATSScanner' \
  --location 'East US 2' \
  --branch 'main' \
  --app-location '/client' \
  --output-location 'build'
```

##### **Option B: Direct Deploy**
```powershell
# Deploy build folder directly
swa deploy ./build --env production --resource-group DefaultResourceGroup-EUS --app-name atsscanner-frontend
```

---

## 🔍 **Step 3: Verify Deployment**

### **Check These URLs:**
1. **Frontend URL**: `https://resumatrix.co` (custom domain)
2. **Fallback URL**: `https://atsscanner-frontend.azurestaticapps.net`
3. **API Endpoints**: 
   - `https://atsscanner-personal-server.azurewebsites.net/api/profile`
   - `https://atsscanner-personal-server.azurewebsites.net/api/auth`

### **Test Flow:**
1. ✅ **Registration/Login** works
2. ✅ **Profile creation/editing** works  
3. ✅ **Resume upload** works
4. ✅ **Payment/subscription** works

---

## 🛠️ **Environment Variables** (Optional)

Create `.env.production` in your client folder:
```env
REACT_APP_API_URL=https://atsscanner-personal-server.azurewebsites.net
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

Then update your services to use:
```typescript
const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7291';
```

---

## 🚨 **Common Issues & Solutions**

### **CORS Issues**
If you get CORS errors, ensure your backend (ATSScanner) has the frontend URL in CORS policy:
```csharp
// In Program.cs
app.UseCors(policy => policy
    .WithOrigins("https://atsscanner-frontend.azurestaticapps.net")
    .AllowAnyMethod()
    .AllowAnyHeader()
);
```

### **Build Errors**
```powershell
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Authentication Issues**
- Verify JWT tokens work with production API
- Check token expiration times
- Ensure HTTPS is used for all API calls

---

## ✅ **Deployment Checklist**

- [ ] ✅ Update all API URLs in service files
- [ ] ✅ Build React app successfully (`npm run build`)
- [ ] ✅ Deploy to Azure Static Web Apps
- [ ] ✅ Test user registration/login
- [ ] ✅ Test profile creation/editing
- [ ] ✅ Test resume upload/analysis
- [ ] ✅ Test payment/subscription flow
- [ ] ✅ Configure custom domain (optional)

---

## 🎉 **Next Steps After Deployment**

1. **Custom Domain** - Point your domain to Static Web App
2. **CI/CD Pipeline** - Auto-deploy on Git push
3. **Monitoring** - Set up Application Insights
4. **Performance** - Enable CDN and caching

**Your Resumatrix will be live at**: 
- **Temporary**: `https://atsscanner-frontend.azurestaticapps.net` 
- **Final**: `https://resumatrix.co` (after custom domain setup) 🚀