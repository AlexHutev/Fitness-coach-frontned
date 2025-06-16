// API configuration and base client setup

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  ME: '/api/v1/auth/me',
  CHANGE_PASSWORD: '/api/v1/auth/change-password',
  VERIFY_TOKEN: '/api/v1/auth/verify-token',
  
  // Clients
  CLIENTS: '/api/v1/clients',
  CLIENT_BY_ID: (id: number) => `/api/v1/clients/${id}`,
  CLIENT_COUNT: '/api/v1/clients/count',
  
  // Exercises
  EXERCISES: '/api/v1/exercises',
  EXERCISE_BY_ID: (id: number) => `/api/v1/exercises/${id}`,
  EXERCISES_PUBLIC: '/api/v1/exercises/public',
  EXERCISES_BULK: '/api/v1/exercises/bulk',
  EXERCISES_MUSCLE_GROUPS: '/api/v1/exercises/muscle-groups',
  EXERCISES_EQUIPMENT_TYPES: '/api/v1/exercises/equipment-types',
  
  // Programs
  PROGRAMS: '/api/v1/programs',
  PROGRAM_BY_ID: (id: number) => `/api/v1/programs/${id}`,
  PROGRAM_DUPLICATE: (id: number) => `/api/v1/programs/${id}/duplicate`,
  PROGRAMS_SEARCH: '/api/v1/programs/search',
  
  // Health
  HEALTH: '/api/v1/health',
} as const;

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiError {
  detail: string;
  status?: number;
}

class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  public removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status;
    
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          error: data.detail || 'An error occurred',
          status,
        };
      }
      
      return {
        data,
        status,
      };
    } catch {
      return {
        error: 'Failed to parse response',
        status,
      };
    }
  }

  public async get<T = unknown>(endpoint: string, options?: { params?: Record<string, unknown> }): Promise<ApiResponse<T>> {
    try {
      let url = `${this.baseURL}${endpoint}`;
      
      if (options?.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        const paramString = searchParams.toString();
        if (paramString) {
          url += `${endpoint.includes('?') ? '&' : '?'}${paramString}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<T>(response);
    } catch {
      return {
        error: 'Network error occurred',
        status: 0,
      };
    }
  }

  public async post<T = unknown>(endpoint: string, data?: unknown, options?: { params?: Record<string, unknown> }): Promise<ApiResponse<T>> {
    try {
      let url = `${this.baseURL}${endpoint}`;
      
      if (options?.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        const paramString = searchParams.toString();
        if (paramString) {
          url += `${endpoint.includes('?') ? '&' : '?'}${paramString}`;
        }
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return this.handleResponse<T>(response);
    } catch {
      return {
        error: 'Network error occurred',
        status: 0,
      };
    }
  }

  public async put<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });
      
      return this.handleResponse<T>(response);
    } catch {
      return {
        error: 'Network error occurred',
        status: 0,
      };
    }
  }

  public async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<T>(response);
    } catch {
      return {
        error: 'Network error occurred',
        status: 0,
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export utility functions
export const setAuthToken = (token: string) => apiClient.setToken(token);
export const removeAuthToken = () => apiClient.removeToken();
export const getAuthToken = () => apiClient['getToken']();
