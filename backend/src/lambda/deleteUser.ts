import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const userId = event.pathParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'userId is required',
          error: 'MISSING_USER_ID'
        })
      };
    }

    // Delete the user from DynamoDB
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { userId }
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'User deleted successfully',
        userId
      })
    };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Failed to delete user',
        error: error.message
      })
    };
  }
};
