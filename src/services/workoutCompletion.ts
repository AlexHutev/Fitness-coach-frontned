import { apiClient } from '@/lib/api';

export interface WeekSummary {
  week_label: string;
  week_start: string;
  total: number;
  completed: number;
  skipped: number;
  completion_rate: number;
}

export interface CompletionStats {
  total_assigned: number;
  total_completed: number;
  total_skipped: number;
  overall_rate: number;
  current_streak: number;
  weekly_breakdown: WeekSummary[];
}

function unwrap<T>(res: { data?: T; error?: string; status: number }): T {
  if (res.error || res.data === undefined) {
    throw new Error(res.error || 'Request failed');
  }
  return res.data;
}

export class WorkoutCompletionService {
  static async getClientCompletion(clientId: number, weeks = 8): Promise<CompletionStats> {
    const res = await apiClient.get<CompletionStats>(
      `/api/v1/progress/clients/${clientId}/completion?weeks=${weeks}`
    );
    return unwrap(res);
  }

  static async getMyCompletion(weeks = 8): Promise<CompletionStats> {
    const res = await apiClient.get<CompletionStats>(
      `/api/v1/progress/my/completion?weeks=${weeks}`
    );
    return unwrap(res);
  }
}
