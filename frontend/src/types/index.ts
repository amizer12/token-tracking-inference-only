export interface User {
  userId: string;
  tokenLimit: number;
  tokenUsage: number;
  remainingTokens: number;
  percentageUsed: number;
  totalCost: number;
  lastUpdated: string;
}

export interface ModelResponse {
  response: string;
  tokensConsumed: number;
  inputTokens: number;
  outputTokens: number;
  remainingTokens: number;
  cost: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
}
