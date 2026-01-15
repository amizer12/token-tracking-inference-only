import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { updateTokenLimit as updateLimit } from '../utils/dynamodb';
import { CORS_HEADERS } from '../utils/cors';

interface UpdateLimitRequest {
  newLimit: number;
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

    const request: UpdateLimitRequest = JSON.parse(event.body);

    if (
      typeof request.newLimit !== 'number' ||
      !Number.isInteger(request.newLimit) ||
      request.newLimit <= 0
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

    const updatedUser = await updateLimit(userId, request.newLimit);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        user: updatedUser
      })
    };
  } catch (error: any) {
    console.error('Error updating token limit:', error);

    if (error.message?.includes('not found')) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'User not found',
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
