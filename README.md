# Token Usage Tracker

A real-time token usage tracking system for monitoring and managing Claude Sonnet 4.5 token consumption.

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

> **Note**: The architecture diagram has been updated to include the DELETE endpoint. To regenerate the PNG, open `docs/architecture.drawio` in [draw.io](https://app.diagrams.net/) and export as PNG.

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
- **API Gateway**: REST API with CORS support
- **Lambda**: 7 serverless functions for business logic
- **DynamoDB**: NoSQL database with on-demand billing and atomic operations
- **Bedrock**: Claude Sonnet 4.5 model inference

## ✨ Quick Start

### Local Development

```bash
# 1. Install dependencies
npm run install:all

# 2. Start mock API server
cd frontend && node mock-api-server.js

# 3. Start frontend (in another terminal)
cd frontend && npm run dev

# 4. Open http://localhost:3000
```

### AWS Deployment (Production)

```bash
# 1. Install dependencies
npm run install:all

# 2. Deploy everything to AWS
npm run deploy
```

**Important**: After first deployment, update `frontend/.env` with the API Gateway URL and redeploy.



## Project Structure

```
token-usage-tracker/
├── frontend/          # React web application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Utility functions
│   └── package.json
├── backend/           # AWS Lambda functions
│   ├── src/
│   │   ├── lambda/        # Lambda function handlers
│   │   ├── utils/         # Shared utilities
│   │   └── types/         # TypeScript interfaces
│   └── package.json
└── package.json       # Root package.json
```

### Key Features

- **Real-time Tracking**: Token usage updates within seconds
- **Atomic Operations**: DynamoDB atomic increments prevent race conditions
- **Error Handling**: Comprehensive error handling at all layers
- **Scalability**: Serverless architecture scales automatically
- **Cost Optimization**: Pay-per-request billing for DynamoDB and Lambda

## License

MIT

---

