'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ClientAuthContextType } from '@/types/api';
import { clientApiService } from '@/services/clientApi';

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

interface ClientAuthProviderProps {
  children: ReactNode;
}

export function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  const [clientId, setClientId] = useState<number | null>(null);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [programName, setProgramName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication data on mount
    const initializeAuth = () => {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('client_token') : null;
        const storedData = clientApiService.getStoredClientData();

        if (storedToken && storedData) {
          setToken(storedToken);
          setClientId(storedData.client_id);
          setAssignmentId(storedData.assignment_id);
          setProgramName(storedData.program_name);
        }
      } catch (error) {
        console.error('Error initializing client auth:', error);
        // Clear invalid data
        clientApiService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await clientApiService.login({ email, password });

      setToken(response.access_token);
      setClientId(response.client_id);
      setAssignmentId(response.assignment_id);
      setProgramName(response.program_name);

      return true;
    } catch (error) {
      console.error('Client login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    clientApiService.logout();
    setToken(null);
    setClientId(null);
    setAssignmentId(null);
    setProgramName(null);
  };

  const isAuthenticated = Boolean(token && clientId && assignmentId);

  const value: ClientAuthContextType = {
    clientId,
    assignmentId,
    programName,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth(): ClientAuthContextType {
  const context = useContext(ClientAuthContext);
  if (context === undefined) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
}

// HOC for protecting client routes
export function withClientAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ClientProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useClientAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Access Restricted
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Please log in to access your training program.
            </p>
            <a
              href="/client/login"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 text-center block"
            >
              Go to Login
            </a>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}