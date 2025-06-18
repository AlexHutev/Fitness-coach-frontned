import { 
  ClientLoginRequest, 
  ClientTokenResponse, 
  ClientDashboardResponse,
  ProgramTemplateForClient,
  WorkoutLogCreate,
  WorkoutLogResponse
} from '@/types/api';
import { apiClient } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const CLIENT_API_BASE = '/api/v1/client';

class ClientApiService {
  private getClientToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('client_token') : null;
  }

  private setClientToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('client_token', token);
    }
  }

  private removeClientToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('client_token');
      localStorage.removeItem('client_data');
    }
  }

  private getAuthHeaders() {
    const token = this.getClientToken();
    return token ? { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : { 'Content-Type': 'application/json' };
  }

  async login(credentials: ClientLoginRequest): Promise<ClientTokenResponse> {
    try {
      const response = await fetch(`${API_BASE}${CLIENT_API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data: ClientTokenResponse = await response.json();
      
      // Store token and client data
      this.setClientToken(data.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('client_data', JSON.stringify({
          client_id: data.client_id,
          assignment_id: data.assignment_id,
          program_name: data.program_name
        }));
      }

      return data;
    } catch (error) {
      console.error('Client login error:', error);
      throw error;
    }
  }

  logout(): void {
    this.removeClientToken();
  }

  async getDashboard(): Promise<ClientDashboardResponse> {
    try {
      const response = await fetch(`${API_BASE}${CLIENT_API_BASE}/dashboard`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch dashboard');
      }

      return await response.json();
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      throw error;
    }
  }

  async getProgram(): Promise<ProgramTemplateForClient> {
    try {
      const response = await fetch(`${API_BASE}${CLIENT_API_BASE}/program`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch program');
      }

      return await response.json();
    } catch (error) {
      console.error('Program fetch error:', error);
      throw error;
    }
  }

  async logWorkout(workoutData: WorkoutLogCreate): Promise<WorkoutLogResponse> {
    try {
      const response = await fetch(`${API_BASE}${CLIENT_API_BASE}/workout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(workoutData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to log workout');
      }

      return await response.json();
    } catch (error) {
      console.error('Workout log error:', error);
      throw error;
    }
  }

  async getWorkoutHistory(limit: number = 20): Promise<WorkoutLogResponse[]> {
    try {
      const response = await fetch(`${API_BASE}${CLIENT_API_BASE}/workouts?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch workout history');
      }

      return await response.json();
    } catch (error) {
      console.error('Workout history fetch error:', error);
      throw error;
    }
  }

  async getWorkoutDetails(workoutId: number): Promise<WorkoutLogResponse> {
    try {
      const response = await fetch(`${API_BASE}${CLIENT_API_BASE}/workout/${workoutId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch workout details');
      }

      return await response.json();
    } catch (error) {
      console.error('Workout details fetch error:', error);
      throw error;
    }
  }

  async updateWorkout(workoutId: number, updateData: any): Promise<WorkoutLogResponse> {
    try {
      const response = await fetch(`${API_BASE}${CLIENT_API_BASE}/workout/${workoutId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update workout');
      }

      return await response.json();
    } catch (error) {
      console.error('Workout update error:', error);
      throw error;
    }
  }

  async getProgressSummary(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}${CLIENT_API_BASE}/progress/summary`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch progress summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Progress summary fetch error:', error);
      throw error;
    }
  }

  async getClientInfo(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}${CLIENT_API_BASE}/me`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch client info');
      }

      return await response.json();
    } catch (error) {
      console.error('Client info fetch error:', error);
      throw error;
    }
  }

  isClientAuthenticated(): boolean {
    return !!this.getClientToken();
  }

  getStoredClientData(): any {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('client_data');
      return data ? JSON.parse(data) : null;
    }
    return null;
  }
}

export const clientApiService = new ClientApiService();