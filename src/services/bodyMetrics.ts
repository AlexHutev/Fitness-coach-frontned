import { apiClient } from '@/lib/api';

export interface BodyMetric {
  id: number;
  client_id: number;
  measured_at: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  waist?: number;
  chest?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
}

export interface BodyMetricCreate {
  measured_at: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  waist?: number;
  chest?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
}

function unwrap<T>(res: { data?: T; error?: string; status: number }): T {
  if (res.error || res.data === undefined) {
    throw Object.assign(new Error(res.error || 'Request failed'), {
      response: { data: { detail: res.error }, status: res.status },
    });
  }
  return res.data;
}

export class BodyMetricService {
  static async getMetrics(clientId: number): Promise<BodyMetric[]> {
    const res = await apiClient.get<BodyMetric[]>(`/api/v1/progress/clients/${clientId}/body-metrics`);
    return unwrap(res);
  }

  static async createMetric(clientId: number, data: BodyMetricCreate): Promise<BodyMetric> {
    const res = await apiClient.post<BodyMetric>(`/api/v1/progress/clients/${clientId}/body-metrics`, data);
    return unwrap(res);
  }

  static async updateMetric(clientId: number, metricId: number, data: Partial<BodyMetricCreate>): Promise<BodyMetric> {
    const res = await apiClient.put<BodyMetric>(`/api/v1/progress/clients/${clientId}/body-metrics/${metricId}`, data);
    return unwrap(res);
  }

  static async deleteMetric(clientId: number, metricId: number): Promise<void> {
    await apiClient.delete(`/api/v1/progress/clients/${clientId}/body-metrics/${metricId}`);
  }

  static async getMyMetrics(): Promise<BodyMetric[]> {
    const res = await apiClient.get<BodyMetric[]>('/api/v1/progress/my/body-metrics');
    return unwrap(res);
  }
}
