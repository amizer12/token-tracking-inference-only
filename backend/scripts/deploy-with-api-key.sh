#!/bin/bash

set -e

echo "🚀 Starting Token Usage Tracker Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build frontend first
echo -e "${BLUE}📦 Building frontend...${NC}"
cd frontend
npm run build
cd ..

# Step 2: Build backend
echo -e "${BLUE}📦 Building backend...${NC}"
cd backend
npm run build

# Step 3: Deploy CDK stack
echo -e "${BLUE}☁️  Deploying CDK stack...${NC}"
npx cdk deploy --require-approval never --outputs-file cdk-outputs.json

# Step 4: Extract outputs
echo -e "${BLUE}📋 Extracting deployment outputs...${NC}"
API_URL=$(cat cdk-outputs.json | grep -o '"ApiUrl": "[^"]*' | grep -o '[^"]*$')
API_KEY_ID=$(cat cdk-outputs.json | grep -o '"ApiKeyId": "[^"]*' | grep -o '[^"]*$')
CLOUDFRONT_URL=$(cat cdk-outputs.json | grep -o '"WebsiteUrl": "[^"]*' | grep -o '[^"]*$')
USER_POOL_ID=$(cat cdk-outputs.json | grep -o '"UserPoolId": "[^"]*' | grep -o '[^"]*$')
USER_POOL_CLIENT_ID=$(cat cdk-outputs.json | grep -o '"UserPoolClientId": "[^"]*' | grep -o '[^"]*$')
AWS_REGION=$(cat cdk-outputs.json | grep -o '"Region": "[^"]*' | grep -o '[^"]*$')

echo -e "${GREEN}✓ API URL: ${API_URL}${NC}"
echo -e "${GREEN}✓ API Key ID: ${API_KEY_ID}${NC}"
echo -e "${GREEN}✓ CloudFront URL: ${CLOUDFRONT_URL}${NC}"
echo -e "${GREEN}✓ User Pool ID: ${USER_POOL_ID}${NC}"
echo -e "${GREEN}✓ User Pool Client ID: ${USER_POOL_CLIENT_ID}${NC}"
echo -e "${GREEN}✓ Region: ${AWS_REGION}${NC}"

# Step 5: Retrieve API Key value
echo -e "${BLUE}🔑 Retrieving API Key value...${NC}"
API_KEY=$(aws apigateway get-api-key --api-key ${API_KEY_ID} --include-value --query 'value' --output text)

if [ -z "$API_KEY" ]; then
    echo -e "${YELLOW}⚠️  Failed to retrieve API key. Please retrieve manually:${NC}"
    echo "aws apigateway get-api-key --api-key ${API_KEY_ID} --include-value --query 'value' --output text"
    exit 1
fi

echo -e "${GREEN}✓ API Key retrieved${NC}"

# Step 6: Update frontend .env.production
echo -e "${BLUE}📝 Updating frontend configuration...${NC}"
cd ../frontend
cat > .env.production << EOF
VITE_API_URL=${API_URL}
VITE_API_KEY=${API_KEY}
VITE_USER_POOL_ID=${USER_POOL_ID}
VITE_USER_POOL_CLIENT_ID=${USER_POOL_CLIENT_ID}
VITE_AWS_REGION=${AWS_REGION}
EOF

echo -e "${GREEN}✓ Frontend .env.production updated${NC}"

# Step 7: Build frontend with API key
echo -e "${BLUE}🏗️  Building frontend with API key...${NC}"
npm run build

# Step 8: Redeploy to update frontend with API key
echo -e "${BLUE}☁️  Redeploying with updated frontend...${NC}"
cd ../backend
npx cdk deploy --require-approval never

# Step 9: Cleanup - Remove .env.production for security
echo -e "${BLUE}🧹 Cleaning up sensitive files...${NC}"
cd ../frontend
if [ -f .env.production ]; then
    rm .env.production
    echo -e "${GREEN}✓ Removed .env.production (API key is now bundled in deployed frontend)${NC}"
fi

# Cleanup CDK outputs file
cd ../backend
rm -f cdk-outputs.json

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🌐 Application URL:${NC} ${CLOUDFRONT_URL}"
echo -e "${GREEN}🔗 API Gateway URL:${NC} ${API_URL}"
echo -e "${GREEN}🔑 API Key:${NC} ${API_KEY}"
echo -e "${GREEN}👤 User Pool ID:${NC} ${USER_POOL_ID}"
echo -e "${GREEN}📱 User Pool Client ID:${NC} ${USER_POOL_CLIENT_ID}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📝 Note: API key and Cognito config have been bundled into the deployed frontend${NC}"
echo -e "${YELLOW}🔒 Security: .env.production has been removed from local filesystem${NC}"
echo ""
