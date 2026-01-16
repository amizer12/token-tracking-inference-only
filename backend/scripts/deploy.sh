#!/bin/bash

# Token Usage Tracker - Complete Deployment Script
# This script builds and deploys both backend and frontend

set -e  # Exit on error

echo "🚀 Starting Token Usage Tracker Deployment"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build Backend
echo -e "\n${BLUE}Step 1: Building Backend Lambda Functions${NC}"
cd "$(dirname "$0")/.."
npm run build

# Step 2: Build Frontend
echo -e "\n${BLUE}Step 2: Building Frontend Application${NC}"
cd ../frontend

# Check if .env exists, if not create it with placeholder
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file with placeholder API URL${NC}"
    echo "VITE_API_URL=PLACEHOLDER" > .env
fi

npm run build

# Step 3: Deploy with CDK
echo -e "\n${BLUE}Step 3: Deploying to AWS with CDK${NC}"
cd ../backend
cdk deploy --require-approval never

# Step 4: Get outputs
echo -e "\n${GREEN}✅ Deployment Complete!${NC}"
echo -e "\n${BLUE}Deployment Outputs:${NC}"
echo "Run 'cdk deploy' output to see your URLs"

# Step 5: Instructions
echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo "1. Get the API URL from the CDK output"
echo "2. Update frontend/.env with: VITE_API_URL=<your-api-url>"
echo "3. Rebuild frontend: cd frontend && npm run build"
echo "4. Redeploy: cd backend && cdk deploy"
echo ""
echo "Your application will be available at the CloudFront URL!"
