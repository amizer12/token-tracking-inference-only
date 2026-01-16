# Token Usage Tracker

A real-time token usage tracking system for monitoring and managing Claude Sonnet 4.5 token consumption.

DISCLAIMER: This is NOT a production code, but a demo - use at your own risk

## Overview

This system provides real-time monitoring and management of token consumption for users interacting with Claude Sonnet 4.5. It consists of a React-based web application, serverless API backend using AWS Lambda, and DynamoDB for data persistence.

## Features

- **Real-time Token Tracking**: Monitor Claude Sonnet 4.5 token consumption with 5-second auto-refresh
- **Cost Calculation**: Automatic inference cost tracking based on AWS Bedrock pricing
  - Input tokens: $0.003 per 1,000 tokens
  - Output tokens: $0.015 per 1,000 tokens
- **User Management**: Create, update, delete users with customizable token limits
- **Interactive Model Interface**: Direct interaction with Claude Sonnet 4.5 with detailed cost breakdown
- **Administrative Dashboard**: Real-time usage analytics and reporting
- **Atomic Operations**: DynamoDB atomic increments prevent race conditions
- **Serverless Architecture**: Auto-scaling with pay-per-use pricing
- **Global CDN**: CloudFront distribution for fast worldwide access
- **Secure**: HTTPS/TLS encryption, private S3 buckets, IAM least-privilege


## Architecture

![Token Usage Tracker Architecture](./docs/architecture.drawio.png)

## API Endpoints

### User Management

#### 1. Create User
**Endpoint**: `POST /users`  
**Lambda**: CreateUserFunction  
**Description**: Creates a new user with specified token limit  
**Request Body**:
```json
{
  "userId": "string",
  "tokenLimit": number
}
```
**Response** (201):
```json
{
  "success": true,
  "user": {
    "userId": "string",
    "tokenLimit": number,
    "tokenUsage": 0,
    "totalCost": 0,
    "lastUpdated": "ISO-8601 timestamp"
  }
}
```

#### 2. Get User Usage
**Endpoint**: `GET /users/{userId}`  
**Lambda**: GetUserUsageFunction  
**Description**: Retrieves token usage details for a specific user  
**Response** (200):
```json
{
  "userId": "string",
  "tokenLimit": number,
  "tokenUsage": number,
  "totalCost": number,
  "lastUpdated": "ISO-8601 timestamp"
}
```

#### 3. Update Token Limit
**Endpoint**: `PUT /users/{userId}/limit`  
**Lambda**: UpdateTokenLimitFunction  
**Description**: Updates the token limit for a user  
**Request Body**:
```json
{
  "newLimit": number
}
```
**Response** (200):
```json
{
  "userId": "string",
  "tokenLimit": number,
  "tokenUsage": number,
  "totalCost": number,
  "lastUpdated": "ISO-8601 timestamp"
}
```

#### 4. List All Users
**Endpoint**: `GET /users`  
**Lambda**: ListAllUsersFunction  
**Description**: Retrieves all users with their usage statistics  
**Response** (200):
```json
{
  "users": [
    {
      "userId": "string",
      "tokenLimit": number,
      "tokenUsage": number,
      "totalCost": number,
      "percentageUsed": number,
      "lastUpdated": "ISO-8601 timestamp"
    }
  ]
}
```

#### 5. Delete User
**Endpoint**: `DELETE /users/{userId}`  
**Lambda**: DeleteUserFunction  
**Description**: Deletes a user and all associated data  
**Response** (200):
```json
{
  "message": "User deleted successfully",
  "userId": "string"
}
```

### Token Usage

#### 6. Record Token Usage
**Endpoint**: `POST /users/{userId}/usage`  
**Lambda**: RecordTokenUsageFunction  
**Description**: Records token consumption for a user (atomic operation)  
**Request Body**:
```json
{
  "tokensConsumed": number
}
```
**Response** (200):
```json
{
  "userId": "string",
  "tokenLimit": number,
  "tokenUsage": number,
  "totalCost": number,
  "lastUpdated": "ISO-8601 timestamp"
}
```

### Model Interaction

#### 7. Invoke Model
**Endpoint**: `POST /invoke/{userId}`  
**Lambda**: InvokeModelFunction  
**Description**: Invokes Claude Sonnet 4.5 with a prompt and tracks token usage and cost  
**Request Body**:
```json
{
  "prompt": "string"
}
```
**Response** (200):
```json
{
  "response": "string",
  "tokensConsumed": number,
  "inputTokens": number,
  "outputTokens": number,
  "remainingTokens": number,
  "cost": {
    "inputCost": number,
    "outputCost": number,
    "totalCost": number
  }
}
```

**Pricing** (Claude Sonnet 4.5):
- Input tokens: $0.003 per 1,000 tokens
- Output tokens: $0.015 per 1,000 tokens

## AWS Services Integration

- **CloudFront**: Global CDN for frontend delivery with HTTPS
- **S3**: Static website hosting with Origin Access Control
- **API Gateway**: REST API with CORS support and API key authentication
- **Lambda**: 7 serverless functions for business logic
- **DynamoDB**: NoSQL database with on-demand billing and atomic operations
- **Bedrock**: Claude Sonnet 4.5 model inference

## API Key Management

The API is secured with API key authentication. All requests must include the `X-API-Key` header.

### Retrieving Your API Key

After deployment, retrieve your API key:

```bash
# Get API Key ID from stack outputs
API_KEY_ID=$(aws cloudformation describe-stacks \
  --stack-name TokenUsageTrackerStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiKeyId`].OutputValue' \
  --output text)

# Get the actual API key value
aws apigateway get-api-key \
  --api-key $API_KEY_ID \
  --include-value \
  --query 'value' \
  --output text
```

### Rate Limits

- **Rate Limit**: 100 requests/second
- **Burst Limit**: 200 requests
- **Daily Quota**: 10,000 requests

### Using the API Key

The frontend automatically includes the API key from the `.env.production` file. For direct API access:

```bash
curl -H "X-API-Key: your-api-key-here" \
     -H "Content-Type: application/json" \
     https://your-api-url/prod/users
```

## ✨ Quick Start

### Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with credentials (`aws configure`)
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- Sufficient AWS permissions (Lambda, API Gateway, DynamoDB, S3, CloudFront, Bedrock)

### 🚀 Automated Deployment (Recommended)

Deploy the entire stack with API key automatically configured:

```bash
# 1. Clone the repository
git clone <repository-url>
cd token-usage-tracker

# 2. Install all dependencies
npm run install:all

# 3. Deploy everything with one command
npm run deploy
```

**That's it!** The deployment script will:
- ✅ Build the backend TypeScript code
- ✅ Deploy all AWS infrastructure (Lambda, API Gateway, DynamoDB, S3, CloudFront)
- ✅ Create and retrieve the API key automatically
- ✅ Configure the frontend with the API key
- ✅ Rebuild and redeploy the frontend with API key embedded
- ✅ Display your application URL and API key

**Expected output:**
```
✅ Deployment Complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Application URL: https://xxxxx.cloudfront.net
🔗 API Gateway URL: https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
🔑 API Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Note: API key has been bundled into the deployed frontend
🔒 Security: .env.production has been removed from local filesystem
```

### 🔧 Manual Deployment (Advanced)

If you prefer manual control or need to troubleshoot:

<details>
<summary>Click to expand manual deployment steps</summary>

```bash
# 1. Install dependencies
npm run install:all

# 2. Build and deploy backend
cd backend
npm run build
npx cdk deploy --outputs-file cdk-outputs.json

# 3. Extract API Key ID from outputs
API_KEY_ID=$(cat cdk-outputs.json | grep -o '"ApiKeyId": "[^"]*' | grep -o '[^"]*$')

# 4. Retrieve the actual API key value
API_KEY=$(aws apigateway get-api-key --api-key $API_KEY_ID --include-value --query 'value' --output text)

# 5. Get the API URL
API_URL=$(cat cdk-outputs.json | grep -o '"ApiUrl": "[^"]*' | grep -o '[^"]*$')

# 6. Configure frontend with API key
cd ../frontend
cat > .env.production << EOF
VITE_API_URL=$API_URL
VITE_API_KEY=$API_KEY
EOF

# 7. Build frontend with API key
npm run build

# 8. Redeploy to update frontend
cd ../backend
npx cdk deploy

# 9. Get your CloudFront URL
aws cloudformation describe-stacks \
  --stack-name TokenUsageTrackerStack \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteUrl`].OutputValue' \
  --output text
```

</details>

### 💻 Local Development

For local development without AWS deployment:

```bash
# 1. Install dependencies
npm run install:all

# 2. Start mock API server (Terminal 1)
cd frontend
node mock-api-server.js

# 3. Start frontend dev server (Terminal 2)
cd frontend
npm run dev

# 4. Open browser
# Navigate to http://localhost:5173
```

### 🗑️ Destroying the Stack

To remove all AWS resources:

```bash
cd backend
npx cdk destroy

# If DynamoDB table persists (has retention policy):
aws dynamodb delete-table --table-name TokenUsageTable
```



## Project Structure

```
token-usage-tracker/
├── frontend/          # React web application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Utility functions
│   ├── .env.production    # Production config (auto-generated)
│   └── package.json
├── backend/           # AWS Lambda functions
│   ├── src/
│   │   ├── lambda/        # Lambda function handlers
│   │   ├── utils/         # Shared utilities
│   │   └── types/         # TypeScript interfaces
│   ├── lib/               # CDK infrastructure code
│   ├── scripts/
│   │   └── deploy-with-api-key.sh  # Automated deployment
│   └── package.json
├── DEPLOYMENT_GUIDE.md    # Detailed deployment docs
└── package.json           # Root package.json
```

## 🎯 First Steps After Deployment

Once deployment is complete:

1. **Access Your Application**
   - Open the CloudFront URL provided in the deployment output
   - Example: `https://xxxxx.cloudfront.net`

2. **Create Your First User**
   - Click on the **Users** tab in the navigation
   - Fill in the form:
     - **User ID**: A unique identifier (e.g., "john-doe")
     - **Token Limit**: Maximum tokens allowed (e.g., 100000)
   - Click **Create User**

3. **Test Model Interaction**
   - Navigate to **Model Interaction** tab
   - The user you just created will be automatically selected
   - Enter a prompt (e.g., "What is AWS Lambda?")
   - Click **Submit Prompt**
   - View the response and cost breakdown

4. **Monitor Usage**
   - Go to **Dashboard** to see real-time token usage
   - Check **Users** page to see all users and their costs
   - Data auto-refreshes every 5-10 seconds

## 📊 Understanding Costs

### AWS Infrastructure Costs (Monthly)
- **CloudFront**: ~$1-3 (1TB free tier)
- **S3**: ~$0.50 (25GB free tier)
- **API Gateway**: ~$3.50/million requests (1M free tier)
- **Lambda**: ~$0.20/million requests (1M free tier)
- **DynamoDB**: ~$1-3 (25GB free tier)

**Estimated Total**: $5-10/month (after free tier)

### Bedrock Inference Costs
- **Input Tokens**: $0.003 per 1,000 tokens
- **Output Tokens**: $0.015 per 1,000 tokens

**Example**: A conversation with 1,000 input tokens and 500 output tokens costs:
- Input: (1,000 / 1,000) × $0.003 = $0.003
- Output: (500 / 1,000) × $0.015 = $0.0075
- **Total**: $0.0105 (~1 cent)

The application tracks these costs automatically for each user!

### Key Features

- **Real-time Tracking**: Token usage updates within seconds
- **Atomic Operations**: DynamoDB atomic increments prevent race conditions
- **Error Handling**: Comprehensive error handling at all layers
- **Scalability**: Serverless architecture scales automatically
- **Cost Optimization**: Pay-per-request billing for DynamoDB and Lambda

## License

MIT

---

