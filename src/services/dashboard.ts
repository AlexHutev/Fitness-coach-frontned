// Trainer dashboard stats service.
//
// Fetches the headline numbers for the dashboard's "Quick Stats" cards
// in a single request. The backend endpoint computes everything against
// the authenticated trainer's data.

import { apiClient, API_ENDPOINTS } from '@/lib/api';

export interface TrainerDashboardStats {
  active_clients: { total: number; delta_this_month: number };
  programs: { total: number; delta_this_week: number };
  sessions_this_week: { total: number; remaining: number };
  client_progress: { average_percentage: number };
}

export class DashboardService {
  static async getTrainerStats(): Promise<TrainerDashboardStats> {
    const response = await apiClient.get<TrainerDashboardStats>(
      API_ENDPOINTS.TRAINER_DASHBOARD_STATS
    );
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Empty response from trainer-stats endpoint');
    }
    return response.data;
  }
}
