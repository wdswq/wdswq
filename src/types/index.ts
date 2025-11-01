export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  citations?: Citation[];
  confidence?: number;
  followUpActions?: FollowUpAction[];
  isStreaming?: boolean;
}

export interface Citation {
  id: string;
  title: string;
  url?: string;
  snippet: string;
}

export interface FollowUpAction {
  id: string;
  label: string;
  action: 'ask_followup' | 'refine' | 'expand';
  prompt: string;
}

export interface ConversationContext {
  id: string;
  messages: Message[];
  filters: FilterState;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterState {
  domain?: string;
  timeRange?: 'day' | 'week' | 'month' | 'year';
  source?: string;
  confidence?: number;
}

export interface SuggestedPrompt {
  id: string;
  text: string;
  category: string;
  icon?: string;
}

export interface AIResponse {
  content: string;
  citations?: Citation[];
  confidence?: number;
  followUpActions?: FollowUpAction[];
  isComplete: boolean;
}

export interface StreamingState {
  isStreaming: boolean;
  currentContent: string;
  status: 'idle' | 'connecting' | 'streaming' | 'completed' | 'error';
  error?: string;
}