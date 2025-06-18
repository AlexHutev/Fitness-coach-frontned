'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/auth';
import type { User, RegisterRequest, UpdateUserRequest, AuthContextType } from '@/types/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = AuthService.getToken();
        if (storedToken) {
          const userResponse = await AuthService.getCurrentUser();
          if (userResponse.data) {
            setUser(userResponse.data);
            setToken(storedToken);
            // Store user data in localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(userResponse.data));
            }
          } else {
            // Token is invalid, remove it
            AuthService.logout();
            if (typeof window !== 'undefined') {
              localStorage.removeItem('user');
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        AuthService.logout();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await AuthService.login({ email, password });
      
      if (response.data) {
        setToken(response.data.access_token);
        
        // Get user data
        const userResponse = await AuthService.getCurrentUser();
        if (userResponse.data) {
          setUser(userResponse.data);
          // Store user data in localStorage for redirect logic
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userResponse.data));
          }
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await AuthService.register(data);
      
      if (response.data) {
        // Auto-login after registration
        return await login(data.email, data.password);
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
    // Clear user data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  };

  const updateUser = async (data: UpdateUserRequest): Promise<boolean> => {
    try {
      const response = await AuthService.updateProfile(data);
      
      if (response.data) {
        setUser(response.data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await AuthService.getCurrentUser();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

// Role-specific protection
export function withTrainerAuth<P extends object>(Component: React.ComponentType<P>) {
  return function TrainerAuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }

    if (user?.role !== 'trainer' && user?.role !== 'admin') {
      if (typeof window !== 'undefined') {
        window.location.href = '/client/dashboard';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

export function withClientAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ClientAuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }

    if (user?.role !== 'client') {
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
      return null;
    }

    return <Component {...props} />;
  };
}
