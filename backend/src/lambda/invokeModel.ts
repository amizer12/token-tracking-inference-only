import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from '@aws-sdk/client-bedrock-runtime';
import { getUser, incrementTokenUsage } from '../utils/dynamodb';
import { CORS_HEADERS } from '../utils/cors';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

interface InvokeModelRequest {
  prompt: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Invalid request',
          message: 'userId path parameter is required'
        })
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Invalid request',
          message: 'Request body is required'
        })
      };
    }

    const request: InvokeModelRequest = JSON.parse(event.body);

    if (!request.prompt || typeof request.prompt !== 'string') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Invalid prompt',
          message: 'Prompt must be a non-empty string'
        })
      };
    }

    // Check user's remaining tokens
    const user = await getUser(userId);

    if (!user) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'User not found',
          message: `User with ID '${userId}' does not exist`
        })
      };
    }

    const remainingTokens = user.tokenLimit - user.tokenUsage;

    if (remainingTokens <= 0) {
      return {
        statusCode: 403,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Token limit exceeded',
          message: 'User has consumed all allocated tokens'
        })
      };
    }

    // Invoke Bedrock with Claude Sonnet 4.5
    // Use inference profile for on-demand throughput
    const modelId = 'us.anthropic.claude-3-5-sonnet-20241022-v2:0';
    
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: request.prompt
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify(payload),
      contentType: 'application/json',
      accept: 'application/json'
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Extract token count from response
    const inputTokens = responseBody.usage?.input_tokens || 0;
    const outputTokens = responseBody.usage?.output_tokens || 0;
    const totalTokens = inputTokens + outputTokens;

    // Update user's token usage
    const updatedUser = await incrementTokenUsage(userId, totalTokens);
    const newRemainingTokens = updatedUser.tokenLimit - updatedUser.tokenUsage;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        response: responseBody.content[0].text,
        tokensConsumed: totalTokens,
        remainingTokens: Math.max(0, newRemainingTokens)
      })
    };
  } catch (error: any) {
    console.error('Error invoking model:', error);

    if (error.name === 'ResourceNotFoundException') {
      return {
        statusCode: 503,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Model unavailable',
          message: 'Claude Sonnet 4.5 is temporarily unavailable'
        })
      };
    }

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      })
    };
  }
};
