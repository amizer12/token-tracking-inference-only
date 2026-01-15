export interface User {
  userId: string;
  tokenLimit: number;
  tokenUsage: number;
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
