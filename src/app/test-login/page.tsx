'use client';

import { useState } from 'react';
import { AuthService } from '@/services/auth';
import { ClientService } from '@/services/clients';

export default function TestLogin() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCompleteFlow = async () => {
    setLoading(true);
    setResult('Starting complete authentication and client creation test...\n\n');
    
    try {
      // Step 1: Check if there's an existing token
      const existingToken = AuthService.getToken();
      setResult(prev => prev + `1. Existing token: ${existingToken ? existingToken.slice(0, 50) + '...' : 'None'}\n`);
      
      // Step 2: Clear any existing auth
      AuthService.logout();
      setResult(prev => prev + `2. Cleared existing authentication\n`);
      
      // Step 3: Test login
      setResult(prev => prev + `3. Attempting login...\n`);
      const loginResponse = await AuthService.login({
        email: 'trainer@fitnesscoach.com',
        password: 'trainer123'
      });
      
      console.log('Login response:', loginResponse);
      
      if (loginResponse.data) {
        setResult(prev => prev + `✅ Login successful! Token: ${loginResponse.data.access_token.slice(0, 50)}...\n`);
        
        // Step 4: Verify token is stored
        const storedToken = AuthService.getToken();
        setResult(prev => prev + `4. Token stored in localStorage: ${storedToken ? 'Yes' : 'No'}\n`);
        
        // Step 5: Test getting current user
        setResult(prev => prev + `5. Testing getCurrentUser...\n`);
        const userResponse = await AuthService.getCurrentUser();
        
        if (userResponse.data) {
          setResult(prev => prev + `✅ User data retrieved: ${userResponse.data.first_name} ${userResponse.data.last_name}\n`);
          
          // Step 6: Test creating a client
          setResult(prev => prev + `6. Testing client creation...\n`);
          const clientData = {
            first_name: 'Test',
            last_name: 'Client',
            email: 'test@example.com',
            primary_goal: 'general_fitness' as const
          };
          
          const clientResponse = await ClientService.createClient(clientData);
          console.log('Client response:', clientResponse);
          
          if (clientResponse.data) {
            setResult(prev => prev + `✅ Client created successfully! ID: ${clientResponse.data.id}\n`);
          } else {
            setResult(prev => prev + `❌ Client creation failed: ${clientResponse.error}\n`);
            setResult(prev => prev + `   Status: ${clientResponse.status}\n`);
          }
          
        } else {
          setResult(prev => prev + `❌ Failed to get user data: ${userResponse.error}\n`);
        }
        
      } else {
        setResult(prev => prev + `❌ Login failed: ${loginResponse.error}\n`);
      }
      
    } catch (error) {
      console.error('Test error:', error);
      setResult(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testCurrentAuth = () => {
    const token = AuthService.getToken();
    const isAuth = AuthService.isAuthenticated();
    setResult(`Current authentication status:
Token exists: ${!!token}
Token value: ${token ? token.slice(0, 50) + '...' : 'None'}
Is authenticated: ${isAuth}
LocalStorage auth_token: ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') : 'N/A'}`);
  };

  const clearAuth = () => {
    AuthService.logout();
    setResult('Authentication cleared!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6">Authentication & Client Creation Test</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={testCompleteFlow}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Complete Flow (Login + Create Client)'}
          </button>
          
          <button
            onClick={testCurrentAuth}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700"
          >
            Check Current Auth Status
          </button>
          
          <button
            onClick={clearAuth}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700"
          >
            Clear Authentication
          </button>
        </div>
        
        {result && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap font-mono">{result}</pre>
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Test Credentials:</strong></p>
          <p>Email: trainer@fitnesscoach.com</p>
          <p>Password: trainer123</p>
        </div>
      </div>
    </div>
  );
}