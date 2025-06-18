// Client dashboard service for API calls

import { apiClient } from '@/lib/api';

export interface ClientProfile {
  user_info: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
  client_info: {
    id: number;
    height?: number;
    weight?: number;
    body_fat_percentage?: number;
    activity_level?: string;
    primary_goal?: string;
    secondary_goals?: string;
    medical_conditions?: string;
    injuries?: string;
    date_of_birth?: string;
    gender?: string;
  };
  trainer_info: {
    id: number;
    name: string;
    email: string;
    specialization?: string;
  };
}

export interface ClientDashboardStats {
  profile_completion: {
    percentage: number;
    missing_fields: string[];
  };
  health_metrics: {
    bmi?: number;
    weight?: number;
    body_fat_percentage?: number;
  };
  program_stats: {
    active_programs: number;
    completed_workouts: number;
    current_streak: number;
  };
}

export class ClientDashboardService {
  /**
   * Get client profile information
   */
  static async getClientProfile() {
    const response = await apiClient.get<ClientProfile>('/api/v1/client-dashboard/profile');
    return response;
  }

  /**
   * Get client programs
   */
  static async getClientPrograms() {
    const response = await apiClient.get<{
      assigned_programs: any[];
      message: string;
    }>('/api/v1/client-dashboard/programs');
    return response;
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    const response = await apiClient.get<ClientDashboardStats>('/api/v1/client-dashboard/dashboard-stats');
    return response;
  }
}
