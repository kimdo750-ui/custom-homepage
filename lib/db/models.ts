// MongoDB 스키마 정의

export interface ConversationLog {
  userId: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
  marketingStage?: 'planning' | 'preparation' | 'execution' | 'optimization';
  focusArea?: string;
}

export interface UserProfile {
  userId: number;
  createdAt: Date;
  lastActivity: Date;
  totalMessages: number;
  currentStage: 'planning' | 'preparation' | 'execution' | 'optimization';
  focusAreas: string[];
  tags: string[];
}

export interface AnalyticsSnapshot {
  timestamp: Date;
  totalUsers: number;
  totalMessages: number;
  totalConversations: number;
  marketingStages: {
    planning: number;
    preparation: number;
    execution: number;
    optimization: number;
  };
  focusAreas: Record<string, number>;
  topKeywords: Array<{ keyword: string; count: number }>;
  aiMetrics: {
    averageResponseTime: number; // ms
    averageResponseLength: number; // tokens
    userSatisfaction?: number; // 0-5
  };
}

export interface MarketingInsight {
  userId: number;
  date: Date;
  stage: string;
  focusArea: string;
  messageCount: number;
  topKeywords: string[];
  recommendedNextStep: string;
  progressScore: number; // 0-100
}
