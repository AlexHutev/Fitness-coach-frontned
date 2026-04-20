import { apiClient } from '@/lib/api';

export interface PerformanceRecord {
  id: number;
  client_id: number;
  trainer_id: number;
  exercise_name: string;
  value: number;
  unit: string;
  record_type: string;
  recorded_at: string;
  notes?: string;
  is_pr: number;
}

export interface PerformanceRecordCreate {
  exercise_name: string;
  value: number;
  unit: string;
  record_type: string;
  recorded_at: string;
  notes?: string;
}

export const RECORD_TYPES = ['1RM', 'Max Reps', 'Best Time', 'Max Distance', 'Best Pace'];
export const UNITS = ['kg', 'lbs', 'reps', 'seconds', 'minutes', 'km', 'miles'];

function unwrap<T>(res: { data?: T; error?: string; status: number }): T {
  if (res.error || res.data === undefined) throw new Error(res.error || 'Request failed');
  return res.data;
}

export class PerformanceRecordService {
  static async getRecords(clientId: number): Promise<PerformanceRecord[]> {
    const res = await apiClient.get<PerformanceRecord[]>(
      `/api/v1/progress/clients/${clientId}/performance-records`
    );
    return unwrap(res);
  }

  static async createRecord(clientId: number, data: PerformanceRecordCreate): Promise<PerformanceRecord> {
    const res = await apiClient.post<PerformanceRecord>(
      `/api/v1/progress/clients/${clientId}/performance-records`, data
    );
    return unwrap(res);
  }

  static async updateRecord(clientId: number, recordId: number, data: Partial<PerformanceRecordCreate>): Promise<PerformanceRecord> {
    const res = await apiClient.put<PerformanceRecord>(
      `/api/v1/progress/clients/${clientId}/performance-records/${recordId}`, data
    );
    return unwrap(res);
  }

  static async deleteRecord(clientId: number, recordId: number): Promise<void> {
    await apiClient.delete(`/api/v1/progress/clients/${clientId}/performance-records/${recordId}`);
  }

  static async getMyRecords(): Promise<PerformanceRecord[]> {
    const res = await apiClient.get<PerformanceRecord[]>('/api/v1/progress/my/performance-records');
    return unwrap(res);
  }
}
