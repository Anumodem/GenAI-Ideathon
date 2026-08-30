export type GoalCategory =
  | 'Career'
  | 'Leadership'
  | 'Technical Skills'
  | 'Communication'
  | 'Productivity'
  | 'Personal Development'
  | 'Learning';

export type GoalPriority = 'high' | 'medium' | 'low';
export type GoalStatus = 'active' | 'completed' | 'archived';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  lastActiveAt: string;
  coachStyle?: 'socratic' | 'action-oriented' | 'empathetic';
}

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  estimatedTime?: string;
}

export interface Goal {
  id: string;
  userId: string;
  sourceReflectionId?: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  actionSteps: ActionItem[];
  targetDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedTags?: string[];
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  category: GoalCategory;
  tags: string[];
  messages: ChatMessage[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reflection {
  id: string;
  userId: string;
  conversationId?: string;
  title: string;
  content: string;
  category: GoalCategory;
  tags: string[];
  insights: string[];
  actionPlanGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  keyThemes: string[];
  wins: string[];
  challenges: string[];
  goalsProgressed: string[];
  areasNeedingAttention: string[];
  recommendedFocusNextWeek: string[];
  executiveSummary: string;
  growthScore: number;
  reflectionCount: number;
  createdAt: string;
  isSavedByUser: boolean;
}

export interface ActionPlanResponse {
  mainReflection: string;
  keyChallenge: string;
  goal: string;
  category: GoalCategory;
  priority: GoalPriority;
  targetDate?: string;
  suggestedActions: {
    id: string;
    text: string;
    estimatedTime?: string;
  }[];
  encouragement: string;
}

export interface TagSuggestionResponse {
  tags: string[];
  suggestedCategory: GoalCategory;
}

export interface WeeklyReviewResponse {
  keyThemes: string[];
  wins: string[];
  challenges: string[];
  goalsProgressed: string[];
  areasNeedingAttention: string[];
  recommendedFocusNextWeek: string[];
  executiveSummary: string;
  growthScore: number;
}
