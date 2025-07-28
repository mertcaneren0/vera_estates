#!/bin/bash

set -e

echo "🚀 CapRover Deployment Script for Vera Gayrimenkul"
echo "=================================================="

# Check if captain-definition exists
if [ ! -f "captain-definition" ]; then
    echo "❌ captain-definition file not found!"
    exit 1
fi

# Create deployment archive
echo "📦 Creating deployment archive..."
tar --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=dist \
    --exclude="*.log" \
    --exclude=".env*" \
    -czf deployment.tar.gz \
    captain-definition \
    Dockerfile.caprover \
    frontend/ \
    .dockerignore

echo "✅ Deployment archive created: deployment.tar.gz"

# Deploy to CapRover
echo "🚢 Deploying to CapRover..."
echo "Run the following command to deploy:"
echo ""
echo "caprover deploy -a vera-gayrimenkul"
echo ""
echo "📋 Pre-deployment checklist:"
echo "1. Make sure you're logged in to CapRover: caprover login"
echo "2. Create app if not exists: caprover apps create vera-gayrimenkul"
echo "3. Set environment variables in CapRover dashboard"
echo "4. Configure persistent storage for uploads"
echo ""
echo "🔧 Environment variables to set in CapRover:"
echo "- NODE_ENV=production"
echo "- DATABASE_URL=postgresql://username:password@srv-captain--your-db:5432/dbname"
echo "- NEXTAUTH_SECRET=your-secret"
echo "- NEXTAUTH_URL=https://your-app.yourdomain.com"
echo "- JWT_SECRET=your-jwt-secret"
echo ""

echo "✅ Ready for deployment!" 