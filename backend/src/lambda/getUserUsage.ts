import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUser } from '../utils/dynamodb';
import { CORS_HEADERS } from '../utils/cors';

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

    const user = await getUser(userId);

    if (!user) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'User not found',
          message: `User with ID '${userId}' does not exist'`
        })
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(user)
    };
  } catch (error: any) {
    console.error('Error getting user:', error);

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
