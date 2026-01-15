import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  ScanCommand,
  GetCommandInput,
  PutCommandInput,
  UpdateCommandInput,
  ScanCommandInput
} from '@aws-sdk/lib-dynamodb';
import { User } from '../types/user';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'TokenUsageTable';

export class DynamoDBError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DynamoDBError';
  }
}

/**
 * Get a user by userId
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const params: GetCommandInput = {
      TableName: TABLE_NAME,
      Key: { userId }
    };

    const result = await docClient.send(new GetCommand(params));
    return result.Item as User | null;
  } catch (error) {
    throw new DynamoDBError(
      `Failed to get user ${userId}`,
      error as Error
    );
  }
}

/**
 * Create a new user
 */
export async function putUser(user: User): Promise<User> {
  try {
    const params: PutCommandInput = {
      TableName: TABLE_NAME,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)'
    };

    await docClient.send(new PutCommand(params));
    return user;
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new DynamoDBError(`User ${user.userId} already exists`);
    }
    throw new DynamoDBError(
      `Failed to create user ${user.userId}`,
      error as Error
    );
  }
}

/**
 * Update user's token limit
 */
export async function updateTokenLimit(
  userId: string,
  newLimit: number
): Promise<User> {
  try {
    const params: UpdateCommandInput = {
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: 'SET tokenLimit = :limit, lastUpdated = :timestamp',
      ExpressionAttributeValues: {
        ':limit': newLimit,
        ':timestamp': new Date().toISOString()
      },
      ConditionExpression: 'attribute_exists(userId)',
      ReturnValues: 'ALL_NEW'
    };

    const result = await docClient.send(new UpdateCommand(params));
    return result.Attributes as User;
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new DynamoDBError(`User ${userId} not found`);
    }
    throw new DynamoDBError(
      `Failed to update token limit for user ${userId}`,
      error as Error
    );
  }
}

/**
 * Atomically increment token usage
 */
export async function incrementTokenUsage(
  userId: string,
  tokensConsumed: number
): Promise<User> {
  try {
    const params: UpdateCommandInput = {
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression:
        'ADD tokenUsage :tokens SET lastUpdated = :timestamp',
      ExpressionAttributeValues: {
        ':tokens': tokensConsumed,
        ':timestamp': new Date().toISOString()
      },
      ConditionExpression: 'attribute_exists(userId)',
      ReturnValues: 'ALL_NEW'
    };

    const result = await docClient.send(new UpdateCommand(params));
    return result.Attributes as User;
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new DynamoDBError(`User ${userId} not found`);
    }
    throw new DynamoDBError(
      `Failed to increment token usage for user ${userId}`,
      error as Error
    );
  }
}

/**
 * Scan all users
 */
export async function scanAllUsers(): Promise<User[]> {
  try {
    const params: ScanCommandInput = {
      TableName: TABLE_NAME
    };

    const result = await docClient.send(new ScanCommand(params));
    return (result.Items || []) as User[];
  } catch (error) {
    throw new DynamoDBError('Failed to scan users', error as Error);
  }
}
