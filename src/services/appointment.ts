import { apiClient } from '@/lib/api';

export interface Appointment {
  id: number;
  trainer_id: number;
  client_id: number;
  title: string;
  description?: string;
  appointment_type: 'Personal Training' | 'Program Review' | 'Initial Assessment' | 'Consultation' | 'Group Session' | 'Follow-up';
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
  appointment_type: Appointment['appointment_type'];
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  location?: string;
  notes?: string;
  status?: Appointment['status'];
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string;
  appointment_type?: Appointment['appointment_type'];
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  location?: string;
  notes?: string;
  status?: Appointment['status'];
}

export interface AppointmentFilters {
  date_from?: string;
  date_to?: string;
  status?: Appointment['status'];
  page?: number;
  size?: number;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  size: number;
}

class AppointmentService {
  async getAppointments(filters?: AppointmentFilters): Promise<AppointmentListResponse> {
    const params = new URLSearchParams();
    
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.size) params.append('size', filters.size.toString());
    
    const url = params.toString() ? `/appointments?${params}` : '/appointments';
    const response = await apiClient.get(url);
    return response.data;
  }

  async getTodaysAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get('/appointments?today_only=true');
    return response.data.appointments || [];
  }

  async getAppointment(id: number): Promise<Appointment> {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data;
  }

  async createAppointment(data: CreateAppointmentData): Promise<Appointment> {
    const response = await apiClient.post('/appointments', data);
    return response.data;
  }

  async updateAppointment(id: number, data: UpdateAppointmentData): Promise<Appointment> {
    const response = await apiClient.put(`/appointments/${id}`, data);
    return response.data;
  }

  async updateAppointmentStatus(id: number, status: Appointment['status']): Promise<Appointment> {
    const response = await apiClient.patch(`/appointments/${id}/status`, { status });
    return response.data;
  }

  async deleteAppointment(id: number): Promise<void> {
    await apiClient.delete(`/appointments/${id}`);
  }
}

export const appointmentService = new AppointmentService();