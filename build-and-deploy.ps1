#!/usr/bin/env pwsh

Write-Host "🚀 Building Resumatrix for All-in-One Deployment" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Step 1: Build React App
Write-Host "📦 Building React Frontend..." -ForegroundColor Yellow
Set-Location client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ React build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ React build completed!" -ForegroundColor Green

# Step 2: Copy React build to .NET wwwroot
Write-Host "📁 Copying React build to .NET wwwroot..." -ForegroundColor Yellow
Set-Location ..
Remove-Item -Recurse -Force ATSScanner/wwwroot/* -ErrorAction SilentlyContinue
Copy-Item -Recurse client/build/* ATSScanner/wwwroot/
Write-Host "✅ Files copied to wwwroot!" -ForegroundColor Green

# Step 3: Build .NET App
Write-Host "🏗️ Building .NET Backend..." -ForegroundColor Yellow
Set-Location ATSScanner
dotnet build --configuration Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ .NET build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ .NET build completed!" -ForegroundColor Green

# Step 4: Publish for deployment
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
dotnet publish --configuration Release --output ../publish
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Publish failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deployment package created in 'publish' folder!" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 All-in-One Build Complete!" -ForegroundColor Green
Write-Host "📁 Deployment files are in: $(Get-Location)/../publish" -ForegroundColor Cyan
Write-Host "🌐 React app will be served from: /wwwroot/" -ForegroundColor Cyan
Write-Host "🔗 API endpoints available at: /api/*" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Ready to deploy to Azure App Service!" -ForegroundColor Green