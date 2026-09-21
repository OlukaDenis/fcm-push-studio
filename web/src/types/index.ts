export interface FirebaseStatus {
  connected: boolean;
  projectId: string | null;
  clientEmail: string | null;
  serviceAccountPath: string | null;
  error?: string | null;
}

export type TargetType = 'token' | 'topic' | 'broadcast';
export type MessageType = 'display' | 'data-only';

export interface AndroidConfig {
  channelId?: string;
  sound?: string;
  priority?: 'high' | 'normal';
}

export interface ApnsConfig {
  badge?: number;
  sound?: string;
}

export interface SendPushPayload {
  messageType?: MessageType;
  targetType: TargetType;
  target?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  data?: Record<string, string>;
  android?: AndroidConfig;
  apns?: ApnsConfig;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  messageType?: MessageType;
  targetType: TargetType;
  target: string;
  error?: string;
  rawResponse?: any;
}

export interface NotificationHistoryItem {
  id: number;
  messageType?: MessageType;
  targetType: TargetType;
  target: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  dataPayload?: string;
  platformConfig?: string;
  status: 'SUCCESS' | 'FAILED';
  fcmMessageId?: string;
  errorMessage?: string;
  fullPayload?: string;
  rawResponse?: string;
  createdAt: string;
}

export interface AppSettings {
  defaultMessageType: MessageType;
  autoInjectApnsBackground: boolean;
  autoAndroidHighPriority: boolean;
}

export interface TopicSubscriptionPayload {
  topic: string;
  token?: string;
  tokens?: string[];
}

export interface TopicOperationResult {
  success: boolean;
  topic: string;
  successCount: number;
  failureCount: number;
  errors?: Array<{ index: number; error: string }>;
  rawResponse?: any;
}
