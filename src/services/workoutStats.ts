import { apiClient } from '@/lib/api';

export interface WeekSummary {
  week_start: string;
  week_label: string;
  total: number;
  completed: number;
  skipped: number;
  pending: number;
  completion_rate: number;
}

export interface WorkoutStats {
  total_assigned: number;
  total_completed: number;
  total_skipped: number;
  overall_rate: number;
  current_streak: number;
  longest_streak: number;
  weekly_breakdown: WeekSummary[];
}

function unwrap<T>(res: { data?: T; error?: string; status: number }): T {
  if (res.error || res.data === undefined) {
    throw new Error(res.error || 'Request failed');
  }
  return res.data;
}

export class WorkoutStatsService {
  static async getClientStats(clientId: number): Promise<WorkoutStats> {
    const res = await apiClient.get<WorkoutStats>(
      `/api/v1/progress/clients/${clientId}/workout-stats`
    );
    return unwrap(res);
  }

  static async getMyStats(): Promise<WorkoutStats> {
    const res = await apiClient.get<WorkoutStats>('/api/v1/progress/my/workout-stats');
    return unwrap(res);
  }
}
