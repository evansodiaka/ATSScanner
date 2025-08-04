# 🔄 Deploy Database Migrations to Azure SQL
# Run this after setting up your Azure SQL Database

param(
    [Parameter(Mandatory=$true)]
    [string]$ConnectionString
)

Write-Host "🔄 Deploying Database Migrations to Azure SQL..." -ForegroundColor Green
Write-Host ""

# Ensure EF Core tools are installed
Write-Host "🔧 Checking EF Core Tools..." -ForegroundColor Cyan
try {
    dotnet ef --version
    Write-Host "✅ EF Core Tools found" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing EF Core Tools..." -ForegroundColor Yellow
    dotnet tool install --global dotnet-ef
}

# Change to the project directory
Set-Location "ATSScanner"

# Test connection
Write-Host "🔍 Testing database connection..." -ForegroundColor Cyan
try {
    dotnet ef migrations list --connection $ConnectionString
    Write-Host "✅ Connection successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Connection failed. Please check your connection string." -ForegroundColor Red
    exit 1
}

# Apply migrations
Write-Host "📊 Applying database migrations..." -ForegroundColor Cyan
Write-Host "Migrations to be applied:" -ForegroundColor Yellow
Write-Host "  1. InitialCreate - Creates basic tables" -ForegroundColor White
Write-Host "  2. AddUserAuthentication - Adds user auth" -ForegroundColor White
Write-Host "  3. AddUserResumeRelationship - Links users to resumes" -ForegroundColor White
Write-Host "  4. AddStripeCustomerId - Adds Stripe integration" -ForegroundColor White
Write-Host "  5. AddMembershipAndUsageTracking - Adds subscription features" -ForegroundColor White
Write-Host "  6. UpdateStripePriceIds - Updates Stripe configuration" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue with migration deployment? (y/N)"
if ($confirm -eq 'y' -or $confirm -eq 'Y') {
    try {
        dotnet ef database update --connection $ConnectionString
        Write-Host ""
        Write-Host "✅ Database migrations deployed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Seed initial data (membership plans)" -ForegroundColor White
        Write-Host "2. Test application connection" -ForegroundColor White
        Write-Host "3. Deploy application to Azure App Service" -ForegroundColor White
    } catch {
        Write-Host "❌ Migration failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Common solutions:" -ForegroundColor Yellow
        Write-Host "  - Check firewall rules allow your IP" -ForegroundColor White
        Write-Host "  - Verify connection string is correct" -ForegroundColor White
        Write-Host "  - Ensure database exists" -ForegroundColor White
    }
} else {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
}

# Return to root directory
Set-Location ".."