import { apiClient } from '@/lib/api';

// Types
export interface Notification {
  id: number;
  user_id: number;
  notification_type: 'workout_completed' | 'day_completed' | 'exercise_not_completed' | 'appointment_upcoming' | 'appointment_reminder' | 'new_assignment' | 'weekly_exercise_update';
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  related_client_id: number | null;
  related_appointment_id: number | null;
  related_workout_log_id: number | null;
  client_name: string | null;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
  total_count: number;
}

export interface MarkReadResponse {
  success: boolean;
  marked_count: number;
}

// Notification Service
export const NotificationService = {
  /**
   * Get notifications for the current user
   */
  async getNotifications(
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<NotificationListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      unread_only: unreadOnly.toString()
    });
    
    const response = await apiClient.get<NotificationListResponse>(
      `/api/v1/notifications/?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ unread_count: number }>(
      '/api/v1/notifications/unread-count'
    );
    return response.data.unread_count;
  },

  /**
   * Mark specific notifications as read
   */
  async markAsRead(notificationIds: number[]): Promise<MarkReadResponse> {
    const response = await apiClient.post<MarkReadResponse>(
      '/api/v1/notifications/mark-read',
      { notification_ids: notificationIds }
    );
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<MarkReadResponse> {
    const response = await apiClient.post<MarkReadResponse>(
      '/api/v1/notifications/mark-all-read'
    );
    return response.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<void> {
    await apiClient.delete(`/api/v1/notifications/${notificationId}`);
  },

  /**
   * Check for appointment reminders (creates new notifications if needed)
   */
  async checkAppointmentReminders(): Promise<{
    created_count: number;
    notifications: Notification[];
  }> {
    const response = await apiClient.post<{
      created_count: number;
      notifications: Notification[];
    }>('/api/v1/notifications/check-appointments');
    return response.data;
  }
};

export default NotificationService;
