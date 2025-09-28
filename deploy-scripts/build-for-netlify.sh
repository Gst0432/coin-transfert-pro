#!/bin/bash

# Build script for Netlify deployment with Supabase backend
# This script builds the frontend for Netlify + Supabase deployment

echo "🚀 Building Exchange Pro for Netlify deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_BUILD_DIR="dist"

# Build frontend for Supabase backend
echo -e "${YELLOW}🔧 Configuring frontend for Supabase backend...${NC}"
export VITE_BACKEND_TYPE=supabase
export NODE_ENV=production

# Load Supabase configuration
if [ -f ".env" ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Build React frontend
echo -e "${YELLOW}⚛️ Building React frontend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Netlify build completed successfully!${NC}"
echo -e "${YELLOW}📦 Build files are ready in: $FRONTEND_BUILD_DIR/${NC}"
echo -e "${YELLOW}🔗 Deploy to Netlify using the existing configuration${NC}"

# Show deployment reminder
echo -e "${YELLOW}📝 Deployment Checklist:${NC}"
echo "1. ✅ Build completed"
echo "2. 🔗 Push to Git repository"
echo "3. 🌐 Deploy via Netlify (auto-deploy if connected)"
echo "4. ⚙️ Verify environment variables in Netlify dashboard"
echo "5. 🎯 Test Supabase integration"

echo -e "${GREEN}🎉 Ready for Netlify deployment! 🚀${NC}"