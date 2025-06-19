// Authentication service for API calls

import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UpdateUserRequest,
  ChangePasswordRequest,
} from '@/types/api';

export class AuthService {
  /**
   * Login user
   */
  static async login(credentials: LoginRequest) {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      credentials
    );

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      // Store the token
      apiClient.setToken(response.data.access_token);
    }

    return response.data;
  }

  /**
   * Register new user
   */
  static async register(userData: RegisterRequest) {
    const response = await apiClient.post<User>(
      API_ENDPOINTS.REGISTER,
      userData
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data;
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser() {
    const response = await apiClient.get<User>(API_ENDPOINTS.ME);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Update current user profile
   */
  static async updateProfile(userData: UpdateUserRequest) {
    const response = await apiClient.put<User>(API_ENDPOINTS.ME, userData);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Change password
   */
  static async changePassword(passwordData: ChangePasswordRequest) {
    const response = await apiClient.post(
      API_ENDPOINTS.CHANGE_PASSWORD,
      passwordData
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Verify token validity
   */
  static async verifyToken() {
    const response = await apiClient.post(API_ENDPOINTS.VERIFY_TOKEN);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Logout user
   */
  static logout() {
    apiClient.removeToken();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Get stored token
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }
}
