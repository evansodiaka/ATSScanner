#!/bin/bash

# 🗄️ Azure SQL Database Setup Script for ATSScanner
# Run this script to set up your production database

set -e  # Exit on any error

# Configuration
RESOURCE_GROUP="ATSScanner-RG"
SQL_SERVER="atsscanner-server"
DATABASE_NAME="ATSScannerDB"
ADMIN_USERNAME="atsadmin"
LOCATION="eastus"

echo "🚀 Starting Azure SQL Database Setup for ATSScanner..."

# Prompt for admin password
read -s -p "Enter SQL Server admin password (min 8 chars, include uppercase, lowercase, numbers): " ADMIN_PASSWORD
echo

# Get your public IP for firewall rule
PUBLIC_IP=$(curl -s https://api.ipify.org)
echo "📍 Your public IP: $PUBLIC_IP"

# 1. Create Resource Group
echo "📦 Creating Resource Group..."
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION"

# 2. Create SQL Server
echo "🖥️ Creating SQL Server..."
az sql server create \
  --name "$SQL_SERVER" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --admin-user "$ADMIN_USERNAME" \
  --admin-password "$ADMIN_PASSWORD"

# 3. Create SQL Database
echo "🗄️ Creating SQL Database..."
az sql db create \
  --server "$SQL_SERVER" \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DATABASE_NAME" \
  --service-objective Basic \
  --backup-storage-redundancy Local

# 4. Configure Firewall Rules
echo "🔥 Configuring Firewall Rules..."

# Allow Azure services
az sql server firewall-rule create \
  --server "$SQL_SERVER" \
  --resource-group "$RESOURCE_GROUP" \
  --name "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your IP
az sql server firewall-rule create \
  --server "$SQL_SERVER" \
  --resource-group "$RESOURCE_GROUP" \
  --name "AllowMyIP" \
  --start-ip-address "$PUBLIC_IP" \
  --end-ip-address "$PUBLIC_IP"

# 5. Display Connection String
echo ""
echo "✅ Database setup complete!"
echo ""
echo "📋 Your connection string:"
echo "Server=tcp://$SQL_SERVER.database.windows.net,1433;Initial Catalog=$DATABASE_NAME;Persist Security Info=False;User ID=$ADMIN_USERNAME;Password=$ADMIN_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
echo ""
echo "🔧 Next Steps:"
echo "1. Update your appsettings.Production.json with the connection string above"
echo "2. Run: dotnet ef database update --connection \"YOUR_CONNECTION_STRING\""
echo "3. Deploy your application to Azure App Service"
echo ""
echo "💰 Cost: ~$5/month for Basic tier"
echo "📊 Monitor usage in Azure Portal > SQL databases > $DATABASE_NAME"