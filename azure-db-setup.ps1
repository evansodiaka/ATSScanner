# 🗄️ Azure SQL Database Setup Script for ATSScanner (PowerShell)
# Run this script to set up your production database

# Configuration
$ResourceGroup = "ATSScanner-RG"
$SqlServer = "atsscanner-server"
$DatabaseName = "ATSScannerDB"
$AdminUsername = "atsadmin"
$Location = "eastus"

Write-Host "🚀 Starting Azure SQL Database Setup for ATSScanner..." -ForegroundColor Green

# Prompt for admin password
$AdminPassword = Read-Host "Enter SQL Server admin password (min 8 chars, include uppercase, lowercase, numbers)" -AsSecureString
$AdminPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($AdminPassword))

# Get your public IP for firewall rule
try {
    $PublicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
    Write-Host "📍 Your public IP: $PublicIP" -ForegroundColor Yellow
} catch {
    Write-Host "⚠️ Could not detect public IP. You'll need to add firewall rules manually." -ForegroundColor Yellow
    $PublicIP = "0.0.0.0"
}

try {
    # 1. Create Resource Group
    Write-Host "📦 Creating Resource Group..." -ForegroundColor Cyan
    az group create --name $ResourceGroup --location $Location

    # 2. Create SQL Server
    Write-Host "🖥️ Creating SQL Server..." -ForegroundColor Cyan
    az sql server create `
        --name $SqlServer `
        --resource-group $ResourceGroup `
        --location $Location `
        --admin-user $AdminUsername `
        --admin-password $AdminPasswordText

    # 3. Create SQL Database
    Write-Host "🗄️ Creating SQL Database..." -ForegroundColor Cyan
    az sql db create `
        --server $SqlServer `
        --resource-group $ResourceGroup `
        --name $DatabaseName `
        --service-objective Basic `
        --backup-storage-redundancy Local

    # 4. Configure Firewall Rules
    Write-Host "🔥 Configuring Firewall Rules..." -ForegroundColor Cyan

    # Allow Azure services
    az sql server firewall-rule create `
        --server $SqlServer `
        --resource-group $ResourceGroup `
        --name "AllowAzureServices" `
        --start-ip-address 0.0.0.0 `
        --end-ip-address 0.0.0.0

    # Allow your IP
    if ($PublicIP -ne "0.0.0.0") {
        az sql server firewall-rule create `
            --server $SqlServer `
            --resource-group $ResourceGroup `
            --name "AllowMyIP" `
            --start-ip-address $PublicIP `
            --end-ip-address $PublicIP
    }

    # 5. Display Connection String
    Write-Host ""
    Write-Host "✅ Database setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Your connection string:" -ForegroundColor Yellow
    $ConnectionString = "Server=tcp://$SqlServer.database.windows.net,1433;Initial Catalog=$DatabaseName;Persist Security Info=False;User ID=$AdminUsername;Password=$AdminPasswordText;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
    Write-Host $ConnectionString -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Update your appsettings.Production.json with the connection string above"
    Write-Host "2. Run: dotnet ef database update --connection `"$ConnectionString`""
    Write-Host "3. Deploy your application to Azure App Service"
    Write-Host ""
    Write-Host "💰 Cost: ~$5/month for Basic tier" -ForegroundColor Green
    Write-Host "📊 Monitor usage in Azure Portal > SQL databases > $DatabaseName" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you're logged in to Azure CLI: az login" -ForegroundColor Yellow
}