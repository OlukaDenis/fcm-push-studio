import axios from 'axios';
import {
  FirebaseStatus,
  SendPushPayload,
  SendResult,
  TopicSubscriptionPayload,
  TopicOperationResult,
  NotificationHistoryItem,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getFirebaseStatus = async (): Promise<FirebaseStatus> => {
  const res = await api.get<FirebaseStatus>('/firebase/status');
  return res.data;
};

export const reloadFirebase = async (): Promise<FirebaseStatus> => {
  const res = await api.post<FirebaseStatus>('/firebase/reload');
  return res.data;
};

export const uploadFirebaseCredentials = async (
  serviceAccount: any,
): Promise<FirebaseStatus> => {
  const res = await api.post<FirebaseStatus>('/firebase/upload', {
    serviceAccount,
  });
  return res.data;
};

export const disconnectFirebase = async (): Promise<FirebaseStatus> => {
  const res = await api.delete<FirebaseStatus>('/firebase/disconnect');
  return res.data;
};

export const sendPushNotification = async (
  payload: SendPushPayload,
): Promise<SendResult> => {
  const res = await api.post<SendResult>('/push/send', payload);
  return res.data;
};

export const subscribeTopic = async (
  payload: TopicSubscriptionPayload,
): Promise<TopicOperationResult> => {
  const res = await api.post<TopicOperationResult>('/topic/subscribe', payload);
  return res.data;
};

export const unsubscribeTopic = async (
  payload: TopicSubscriptionPayload,
): Promise<TopicOperationResult> => {
  const res = await api.post<TopicOperationResult>('/topic/unsubscribe', payload);
  return res.data;
};

export const getHistory = async (params?: {
  limit?: number;
  offset?: number;
  targetType?: string;
  status?: string;
}): Promise<{ items: NotificationHistoryItem[]; total: number }> => {
  const res = await api.get<{ items: NotificationHistoryItem[]; total: number }>(
    '/history',
    { params },
  );
  return res.data;
};

export const getHistoryItem = async (
  id: number,
): Promise<NotificationHistoryItem> => {
  const res = await api.get<NotificationHistoryItem>(`/history/${id}`);
  return res.data;
};

export const deleteHistoryItem = async (
  id: number,
): Promise<{ success: boolean }> => {
  const res = await api.delete<{ success: boolean }>(`/history/${id}`);
  return res.data;
};

export const clearAllHistory = async (): Promise<{ success: boolean }> => {
  const res = await api.delete<{ success: boolean }>('/history');
  return res.data;
};

export default api;
