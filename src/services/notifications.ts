import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'NewComment' | 'NewLike' | 'PostLiked' | 'NewFollower' | 'CommentLike' | 'CommentReply' | 'PostPublished';
  isRead: boolean;
  actionUrl?: string;
  actionData?: string;
  createdAt: string;
  readAt?: string;
  actorId?: string;
  postId?: string;
  commentId?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const notificationsService = {
  // Kullanıcının bildirimlerini getir
  getNotifications: async (page = 1, pageSize = 20): Promise<NotificationsResponse> => {
    const response = await api.get(`/notifications?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Bildirimi okundu olarak işaretle
  markAsRead: async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/mark-read`);
  },

  // Tüm bildirimleri okundu olarak işaretle
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/mark-all-read');
  },

  // Okunmamış bildirim sayısını getir
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.unreadCount;
  },

  // Bildirimi sil
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Test bildirimi oluştur
  createTestNotification: async (): Promise<void> => {
    await api.post('/notifications/test');
  }
}; 