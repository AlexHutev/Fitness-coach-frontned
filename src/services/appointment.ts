import { apiClient } from '@/lib/api';

export interface Appointment {
  id: number;
  trainer_id: number;
  client_id: number;
  title: string;
  description?: string;
  appointment_type: string;
  status: 'scheduled' | 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';
  start_time: string;
  end_time: string;
  duration_minutes: number;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
  };
  trainer?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CreateAppointmentData {
  client_id: number;
  title: string;
  description?: string;
  appointment_type: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  location?: string;
  notes?: string;
  status?: string;
}

export interface UpdateAppointmentData {
  client_id?: number;
  title?: string;
  description?: string;
  appointment_type?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  location?: string;
  notes?: string;
  status?: string;
}

export interface AppointmentFilters {
  date_from?: string;
  date_to?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  size: number;
}

// Helper: throw if the apiClient response contains an error
function unwrap<T>(response: { data?: T; error?: string; status: number }): T {
  if (response.error || !response.data) {
    throw Object.assign(new Error(response.error || 'Request failed'), {
      response: { data: { detail: response.error }, status: response.status },
    });
  }
  return response.data;
}

class AppointmentService {
  async getTodaysAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>('/api/v1/appointments/today');
    return unwrap(response) ?? [];
  }

  async getAppointments(filters?: AppointmentFilters): Promise<AppointmentListResponse> {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('skip', ((filters.page - 1) * (filters.size || 10)).toString());
    if (filters?.size) params.append('limit', filters.size.toString());

    const url = params.toString() ? `/api/v1/appointments?${params}` : '/api/v1/appointments';
    const response = await apiClient.get<Appointment[]>(url);
    const appointments = unwrap(response) ?? [];
    return { appointments, total: appointments.length, page: filters?.page || 1, size: filters?.size || 50 };
  }

  async getAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.get<Appointment>(`/api/v1/appointments/${id}`);
    return unwrap(response);
  }

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await apiClient.post<Appointment>('/api/v1/appointments', data);
    return unwrap(response);
  }

  async updateAppointment(id: number, data: UpdateAppointmentData): Promise<Appointment> {
    const response = await apiClient.put<Appointment>(`/api/v1/appointments/${id}`, data);
    return unwrap(response);
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(`/api/v1/appointments/${id}/status`, { status });
    return unwrap(response);
  }

  async deleteAppointment(id: number): Promise<void> {
    await apiClient.delete(`/api/v1/appointments/${id}`);
  }
}

export const appointmentService = new AppointmentService();
