export const NOTIFICATION_PROVIDER = 'NOTIFICATION_PROVIDER';

export interface SendResult {
  success: boolean;
  messageId?: string;
  messageType?: 'display' | 'data-only';
  targetType: 'token' | 'topic' | 'broadcast';
  target: string;
  error?: string;
  rawResponse?: any;
}

export interface INotificationProvider {
  sendPush(payload: any): Promise<SendResult>;
}
