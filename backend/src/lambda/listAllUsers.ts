import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { scanAllUsers } from '../utils/dynamodb';
import { CORS_HEADERS } from '../utils/cors';

export const handler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const users = await scanAllUsers();

    const usersWithPercentage = users.map(user => ({
      ...user,
      percentageUsed: user.tokenLimit > 0 
        ? Math.round((user.tokenUsage / user.tokenLimit) * 100 * 100) / 100
        : 0
    }));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        users: usersWithPercentage
      })
    };
  } catch (error: any) {
    console.error('Error listing users:', error);

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
