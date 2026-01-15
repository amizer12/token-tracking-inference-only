import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { putUser } from '../utils/dynamodb';
import { User } from '../types/user';
import { CORS_HEADERS } from '../utils/cors';

interface CreateUserRequest {
  userId: string;
  tokenLimit: number;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
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

    const request: CreateUserRequest = JSON.parse(event.body);

    // Validate userId
    if (!request.userId || typeof request.userId !== 'string') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Invalid userId',
          message: 'userId must be a non-empty string'
        })
      };
    }

    // Validate tokenLimit
    if (
      typeof request.tokenLimit !== 'number' ||
      !Number.isInteger(request.tokenLimit) ||
      request.tokenLimit <= 0
    ) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Invalid token limit',
          message: 'Token limit must be a positive integer'
        })
      };
    }

    // Create user
    const user: User = {
      userId: request.userId,
      tokenLimit: request.tokenLimit,
      tokenUsage: 0,
      lastUpdated: new Date().toISOString()
    };

    const createdUser = await putUser(user);

    return {
      statusCode: 201,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        user: createdUser
      })
    };
  } catch (error: any) {
    console.error('Error creating user:', error);

    if (error.message?.includes('already exists')) {
      return {
        statusCode: 409,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'User already exists',
          message: error.message
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
