# 🌐 **Custom Domain Setup: resumatrix.co**

## 🎯 **Domain Overview**
- **Primary Domain**: `resumatrix.co`  
- **With WWW**: `www.resumatrix.co`
- **Azure Static Web App**: `atsscanner-frontend.azurestaticapps.net`

---

## 📝 **Step 1: Purchase Domain**

### **Recommended Registrars:**
1. **NameCheap** - Great pricing, good management interface
2. **GoDaddy** - Popular, easy setup
3. **Google Domains** - Clean interface, Google integration
4. **Azure Domain Services** - Direct integration with Azure

### **Domain Purchase Checklist:**
- [x] **Domain**: `resumatrix.co`
- [ ] **Domain Privacy**: Enable to protect personal info
- [ ] **Auto-renewal**: Enable to prevent expiration
- [ ] **SSL Certificate**: Not needed (Azure provides free SSL)

---

## 🔧 **Step 2: Configure DNS Records**

### **Required DNS Records:**
After purchasing, add these DNS records at your registrar:

#### **A Record (Root Domain)**
```
Type: A
Name: @ (or leave blank for root)
Value: [Get this from Azure Static Web Apps custom domain setup]
TTL: 3600 (1 hour)
```

#### **CNAME Record (WWW Subdomain)**
```
Type: CNAME  
Name: www
Value: atsscanner-frontend.azurestaticapps.net
TTL: 3600 (1 hour)
```

#### **CNAME Record (Domain Verification)**
```
Type: CNAME
Name: [Azure will provide unique verification name]
Value: [Azure will provide verification value]
TTL: 3600 (1 hour)
```

---

## 🚀 **Step 3: Configure Azure Static Web Apps**

### **In Azure Portal:**

#### **1. Navigate to Your Static Web App**
- Go to **Azure Portal** → **Static Web Apps**
- Select **atsscanner-frontend**

#### **2. Add Custom Domain**
```bash
# Navigate to: Settings → Custom domains → Add

# Add both domains:
1. resumatrix.co (root domain)
2. www.resumatrix.co (subdomain)
```

#### **3. Domain Verification**
Azure will provide a **CNAME verification record**:
- Copy the **Name** and **Value**  
- Add this CNAME record to your DNS
- Wait for verification (5-60 minutes)

#### **4. SSL Certificate**
Azure automatically provides **free SSL certificates** for custom domains!

---

## 🛠️ **Step 4: Update Application Configuration**

### **Frontend Updates Required:**

#### **1. Update Package.json**
```json
{
  "name": "resumatrix-frontend",
  "homepage": "https://resumatrix.co",
  "description": "AI-powered ATS resume optimization platform"
}
```

#### **2. Add Environment Variables**
Create `.env.production`:
```env
REACT_APP_DOMAIN=resumatrix.co
REACT_APP_API_URL=https://atsscanner-personal-server.azurewebsites.net
PUBLIC_URL=https://resumatrix.co
```

#### **3. Update Service Files** (if needed)
Your existing API URLs remain the same:
```typescript
const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://atsscanner-personal-server.azurewebsites.net/api/auth"
  : "https://localhost:7291/api/auth";
```

---

## 📱 **Step 5: Update Branding & Metadata**

### **Update public/index.html:**
```html
<title>Resumatrix - AI-Powered ATS Resume Optimization</title>
<meta name="description" content="Optimize your resume for ATS systems with AI-powered analysis and recommendations" />
<meta property="og:title" content="Resumatrix - AI Resume Optimization" />
<meta property="og:description" content="Beat ATS systems with AI-powered resume optimization" />
<meta property="og:url" content="https://resumatrix.co" />
<link rel="canonical" href="https://resumatrix.co" />
```

### **Update App.tsx Header:**
```typescript
<Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, fontFamily: "cursive" }}>
  <Link 
    to={currentUser ? "/dashboard" : "/"} 
    style={{ color: 'inherit', textDecoration: 'none' }}
  >
    Resumatrix
  </Link>
</Typography>
```

---

## 🔍 **Step 6: Testing & Verification**

### **DNS Propagation Check:**
```bash
# Check if DNS is working (use online tools):
https://dnschecker.org
https://whatsmydns.net

# Test these URLs:
https://resumatrix.co
https://www.resumatrix.co
```

### **Functionality Testing:**
- [ ] ✅ **Domain loads correctly**
- [ ] ✅ **SSL certificate active** (green lock icon)
- [ ] ✅ **Both www and non-www work**
- [ ] ✅ **API calls work from custom domain**
- [ ] ✅ **Authentication works**
- [ ] ✅ **All features functional**

---

## 🚨 **Common Issues & Solutions**

### **DNS Propagation Delays**
- **Problem**: Domain doesn't load immediately
- **Solution**: Wait 24-48 hours for full global DNS propagation
- **Quick Fix**: Clear browser cache, try incognito mode

### **SSL Certificate Issues**
- **Problem**: "Not Secure" warning
- **Solution**: Azure auto-generates SSL, wait 1-2 hours after domain verification
- **Alternative**: Force HTTPS redirects in Azure Static Web Apps settings

### **CORS Errors**
- **Problem**: API calls blocked from custom domain
- **Solution**: Already fixed in backend `Program.cs` - includes `resumatrix.co`

### **Redirect Loop**
- **Problem**: Infinite redirects between www and non-www
- **Solution**: Configure primary domain in Azure Static Web Apps settings

---

## 📋 **Domain Setup Checklist**

### **Domain Registrar:**
- [ ] ✅ Purchase **resumatrix.co**
- [ ] ✅ Enable domain privacy
- [ ] ✅ Set up auto-renewal
- [ ] ✅ Access DNS management

### **DNS Configuration:**
- [ ] ✅ Add A record for root domain
- [ ] ✅ Add CNAME record for www subdomain  
- [ ] ✅ Add verification CNAME record
- [ ] ✅ Wait for propagation (check with DNS tools)

### **Azure Configuration:**
- [ ] ✅ Add custom domain in Static Web Apps
- [ ] ✅ Complete domain verification
- [ ] ✅ Confirm SSL certificate active
- [ ] ✅ Test both www and non-www versions

### **Application Updates:**
- [ ] ✅ Update package.json homepage
- [ ] ✅ Update HTML metadata  
- [ ] ✅ Update app branding/titles
- [ ] ✅ Test all functionality with custom domain

---

## 🎉 **Final Result**

**Your application will be live at:**
- ✅ **https://resumatrix.co** 
- ✅ **https://www.resumatrix.co**

**With features:**
- 🔒 **Free SSL Certificate** (HTTPS secure)
- 🌍 **Global CDN** (fast loading worldwide)  
- 📱 **Professional branding** with custom domain
- 🚀 **Production-ready** with all features functional

**Welcome to the professional web! Your ATSScanner is now Resumatrix.co!** 🎯