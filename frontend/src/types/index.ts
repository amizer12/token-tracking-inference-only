export interface User {
  userId: string;
  tokenLimit: number;
  tokenUsage: number;
  remainingTokens: number;
  percentageUsed: number;
  lastUpdated: string;
}

export interface ModelResponse {
  response: string;
  tokensConsumed: number;
  remainingTokens: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}
