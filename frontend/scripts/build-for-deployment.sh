#!/bin/bash

# Frontend Build Script for AWS Deployment
# This script builds the frontend with production settings

set -e

echo "🏗️  Building Token Usage Tracker Frontend for Production"
echo "========================================================"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  Warning: .env.production not found"
    echo "Creating from template..."
    cp .env.production.template .env.production
    echo ""
    echo "❌ Please update .env.production with your API Gateway URL"
    echo "   Get the URL from: cd backend && cdk deploy"
    echo ""
    exit 1
fi

# Check if API URL is set
if grep -q "your-api-id" .env.production; then
    echo "❌ Error: .env.production still contains placeholder values"
    echo "   Please update VITE_API_URL with your actual API Gateway URL"
    exit 1
fi

echo "✅ Environment configuration found"
echo ""

# Build
echo "📦 Building application..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📁 Build output: frontend/dist/"
echo ""
echo "Next steps:"
echo "1. Deploy backend: cd backend && cdk deploy"
echo "2. Frontend will be automatically deployed to CloudFront"
echo ""
