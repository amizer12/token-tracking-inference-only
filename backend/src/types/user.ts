export interface User {
  userId: string;
  tokenLimit: number;
  tokenUsage: number;
  totalCost: number; // Total inference cost in USD
  lastUpdated: string;
}

export interface UserCreateInput {
  userId: string;
  tokenLimit: number;
}

export interface UserUpdateLimitInput {
  userId: string;
  newLimit: number;
}

export interface TokenUsageUpdate {
  userId: string;
  tokensConsumed: number;
}
