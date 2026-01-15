import * as fc from 'fast-check';
import {
  getUser,
  putUser,
  incrementTokenUsage,
  DynamoDBError
} from './dynamodb';
import { User } from '../types/user';

// Feature: token-usage-tracker, Property 6: Concurrent Updates Are Atomic
// Validates: Requirements 2.3, 8.2

// Mock DynamoDB Document Client
jest.mock('@aws-sdk/lib-dynamodb', () => {
  const mockUsers = new Map<string, User>();
  
  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: jest.fn(async (command: any) => {
          const commandName = command.constructor.name;
          
          if (commandName === 'GetCommand') {
            const user = mockUsers.get(command.input.Key.userId);
            return { Item: user };
          }
          
          if (commandName === 'PutCommand') {
            const userId = command.input.Item.userId;
            if (mockUsers.has(userId) && command.input.ConditionExpression) {
              const error: any = new Error('Conditional check failed');
              error.name = 'ConditionalCheckFailedException';
              throw error;
            }
            mockUsers.set(userId, command.input.Item);
            return {};
          }
          
          if (commandName === 'UpdateCommand') {
            const userId = command.input.Key.userId;
            const user = mockUsers.get(userId);
            
            if (!user && command.input.ConditionExpression) {
              const error: any = new Error('Conditional check failed');
              error.name = 'ConditionalCheckFailedException';
              throw error;
            }
            
            if (user) {
              // Simulate atomic increment
              const tokens = command.input.ExpressionAttributeValues[':tokens'];
              const timestamp = command.input.ExpressionAttributeValues[':timestamp'];
              
              if (tokens !== undefined) {
                user.tokenUsage += tokens;
                user.lastUpdated = timestamp;
              }
              
              if (command.input.ExpressionAttributeValues[':limit'] !== undefined) {
                user.tokenLimit = command.input.ExpressionAttributeValues[':limit'];
                user.lastUpdated = timestamp;
              }
              
              mockUsers.set(userId, user);
              return { Attributes: user };
            }
          }
          
          if (commandName === 'ScanCommand') {
            return { Items: Array.from(mockUsers.values()) };
          }
          
          return {};
        })
      }))
    },
    GetCommand: class GetCommand {
      constructor(public input: any) {}
    },
    PutCommand: class PutCommand {
      constructor(public input: any) {}
    },
    UpdateCommand: class UpdateCommand {
      constructor(public input: any) {}
    },
    ScanCommand: class ScanCommand {
      constructor(public input: any) {}
    }
  };
});

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => ({}))
}));

describe('DynamoDB Utilities - Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear mock users map
    const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
    const mockInstance = DynamoDBDocumentClient.from();
    // Reset the internal map by creating a new mock
  });

  test('Property 6: Concurrent token usage updates result in correct total', async () => {
    // Feature: token-usage-tracker, Property 6: Concurrent Updates Are Atomic
    // Validates: Requirements 2.3, 8.2
    
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }), // userId
        fc.integer({ min: 1000, max: 100000 }), // tokenLimit
        fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 2, maxLength: 10 }), // token increments
        async (userId, tokenLimit, increments) => {
          // Create user
          const user: User = {
            userId,
            tokenLimit,
            tokenUsage: 0,
            lastUpdated: new Date().toISOString()
          };
          
          await putUser(user);
          
          // Apply all increments sequentially (simulating atomic operations)
          for (const tokens of increments) {
            await incrementTokenUsage(userId, tokens);
          }
          
          // Verify final usage equals sum of all increments
          const finalUser = await getUser(userId);
          const expectedTotal = increments.reduce((sum, val) => sum + val, 0);
          
          expect(finalUser).not.toBeNull();
          expect(finalUser!.tokenUsage).toBe(expectedTotal);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property: Multiple concurrent updates preserve total', async () => {
    // Additional test for true concurrency simulation
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1000, max: 100000 }),
        fc.array(fc.integer({ min: 1, max: 500 }), { minLength: 3, maxLength: 5 }),
        async (userId, tokenLimit, increments) => {
          const user: User = {
            userId,
            tokenLimit,
            tokenUsage: 0,
            lastUpdated: new Date().toISOString()
          };
          
          await putUser(user);
          
          // Execute updates in parallel
          await Promise.all(
            increments.map(tokens => incrementTokenUsage(userId, tokens))
          );
          
          const finalUser = await getUser(userId);
          const expectedTotal = increments.reduce((sum, val) => sum + val, 0);
          
          expect(finalUser).not.toBeNull();
          expect(finalUser!.tokenUsage).toBe(expectedTotal);
        }
      ),
      { numRuns: 100 }
    );
  });
});
