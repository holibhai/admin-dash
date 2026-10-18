/**
 * Mentify AI Assistant Type Definitions
 * Strictly aligned with backend API contracts, WebSocket STOMP protocol, and RBAC governance.
 */

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

export type MessageRole = 'user' | 'assistant' | 'system';

export type AiWebSocketStatus =
  | 'CONNECTED'
  | 'CONNECTING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'ERROR'
  | 'DISCONNECTED'
  | 'RECONNECTING';

export type MessageStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

export type ConversationDateGroup = 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Older';

export interface AiMessage {
  id: string;
  conversationId: string;
  clientMessageId?: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  toolsUsed?: string[];
  status?: MessageStatus;
  errorMessage?: string;
}

export interface AiConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: AiMessage[];
}

export interface AiChatRequest {
  conversationId: string;
  clientMessageId: string;
  message: string;
}

export interface AiChatResponse {
  conversationId: string;
  messageId: string;
  clientMessageId: string;
  message: string;
  toolsUsed?: string[];
  timestamp: string;
}

export interface AiWebSocketMessage {
  conversationId: string;
  messageId: string;
  clientMessageId: string;
  status: 'PROCESSING' | 'COMPLETED' | 'ERROR';
  message: string;
  data?: any;
  toolsUsed?: string[];
  timestamp: string;
}

export interface PromptSuggestion {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: 'tool' | 'concept' | 'analytics';
  toolName?: 'getUserRegistrationOverview' | 'getTodayQuizPerformance';
}
