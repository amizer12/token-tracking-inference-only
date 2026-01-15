import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { incrementTokenUsage } from '../utils/dynamodb';
import { CORS_HEADERS } from '../utils/cors';

interface RecordUsageRequest {
  tokensConsumed: number;
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

    const request: RecordUsageRequest = JSON.parse(event.body);

    if (
      typeof request.tokensConsumed !== 'number' ||
      request.tokensConsumed < 0
    ) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Invalid tokens consumed',
          message: 'Tokens consumed must be a non-negative number'
        })
      };
    }

    const updatedUser = await incrementTokenUsage(userId, request.tokensConsumed);
    const remainingTokens = updatedUser.tokenLimit - updatedUser.tokenUsage;

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        userId: updatedUser.userId,
        tokenUsage: updatedUser.tokenUsage,
        remainingTokens: Math.max(0, remainingTokens)
      })
    };
  } catch (error: any) {
    console.error('Error recording token usage:', error);

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
