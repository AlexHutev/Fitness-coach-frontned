import { apiClient } from '@/lib/api';

export interface GoalMilestone {
  id: number;
  client_id: number;
  trainer_id: number;
  title: string;
  goal_type: string;
  metric: string;
  unit?: string;
  start_value: number;
  target_value: number;
  current_value?: number;
  start_date: string;
  target_date?: string;
  is_completed: boolean;
  completed_date?: string;
  notes?: string;
  progress_pct: number;
}

export interface GoalCreate {
  title: string;
  goal_type: string;
  metric: string;
  unit: string;
  start_value: number;
  target_value: number;
  current_value?: number;
  start_date: string;
  target_date?: string;
  notes?: string;
}

export const GOAL_TYPES = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'weight_gain', label: 'Weight Gain' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'strength', label: 'Strength' },
  { value: 'general_fitness', label: 'General Fitness' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
  { value: 'custom', label: 'Custom' },
];

export const METRICS = [
  { value: 'weight', label: 'Weight (kg)' },
  { value: 'body_fat_percentage', label: 'Body Fat (%)' },
  { value: 'muscle_mass', label: 'Muscle Mass (kg)' },
  { value: 'waist', label: 'Waist (cm)' },
  { value: 'custom', label: 'Custom' },
];

function unwrap<T>(res: { data?: T; error?: string; status: number }): T {
  if (res.error || res.data === undefined) throw new Error(res.error || 'Request failed');
  return res.data;
}

export class GoalMilestoneService {
  static async getGoals(clientId: number): Promise<GoalMilestone[]> {
    const res = await apiClient.get<GoalMilestone[]>(`/api/v1/progress/clients/${clientId}/goals`);
    return unwrap(res);
  }

  static async createGoal(clientId: number, data: GoalCreate): Promise<GoalMilestone> {
    const res = await apiClient.post<GoalMilestone>(`/api/v1/progress/clients/${clientId}/goals`, data);
    return unwrap(res);
  }

  static async updateGoal(clientId: number, goalId: number, data: Partial<GoalCreate & { is_completed: boolean; current_value: number }>): Promise<GoalMilestone> {
    const res = await apiClient.put<GoalMilestone>(`/api/v1/progress/clients/${clientId}/goals/${goalId}`, data);
    return unwrap(res);
  }

  static async deleteGoal(clientId: number, goalId: number): Promise<void> {
    await apiClient.delete(`/api/v1/progress/clients/${clientId}/goals/${goalId}`);
  }

  static async getMyGoals(): Promise<GoalMilestone[]> {
    const res = await apiClient.get<GoalMilestone[]>('/api/v1/progress/my/goals');
    return unwrap(res);
  }
}
