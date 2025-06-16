'use client';

import { useState } from 'react';
import { AuthService } from '@/services/auth';

export default function TestAPI() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testClientCreation = async () => {
    setLoading(true);
    setResult('Testing client creation API...\n\n');
    
    try {
      // Step 1: Login first
      setResult(prev => prev + '1. Logging in...\n');
      const loginResponse = await AuthService.login({
        email: 'trainer@fitnesscoach.com',
        password: 'trainer123'
      });
      
      if (!loginResponse.data) {
        setResult(prev => prev + `❌ Login failed: ${loginResponse.error}\n`);
        return;
      }
      
      const token = loginResponse.data.access_token;
      setResult(prev => prev + `✅ Login successful! Token: ${token.slice(0, 30)}...\n\n`);
      
      // Step 2: Test client creation with direct fetch
      setResult(prev => prev + '2. Testing client creation with direct fetch...\n');
      
      const clientData = {
        first_name: 'Test',
        last_name: 'Client',
        email: 'test@example.com',
        primary_goal: 'general_fitness'
      };
      
      setResult(prev => prev + `Request data: ${JSON.stringify(clientData, null, 2)}\n\n`);
      
      const response = await fetch('http://localhost:8000/api/v1/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clientData)
      });
      
      setResult(prev => prev + `Response status: ${response.status}\n`);
      setResult(prev => prev + `Response status text: ${response.statusText}\n`);
      
      const responseData = await response.json();
      setResult(prev => prev + `Response data: ${JSON.stringify(responseData, null, 2)}\n`);
      
      if (response.ok) {
        setResult(prev => prev + `✅ Client created successfully!\n`);
      } else {
        setResult(prev => prev + `❌ Client creation failed\n`);
        
        // Check if it's a validation error
        if (response.status === 422) {
          setResult(prev => prev + '\n🔍 Validation errors:\n');
          if (responseData.detail && Array.isArray(responseData.detail)) {
            responseData.detail.forEach((error: any, index: number) => {
              setResult(prev => prev + `  ${index + 1}. Field: ${error.loc?.join('.')}, Error: ${error.msg}\n`);
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Test error:', error);
      setResult(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testWithMinimalData = async () => {
    setLoading(true);
    setResult('Testing with minimal required data...\n\n');
    
    try {
      // Login first
      const loginResponse = await AuthService.login({
        email: 'trainer@fitnesscoach.com',
        password: 'trainer123'
      });
      
      if (!loginResponse.data) {
        setResult(prev => prev + `❌ Login failed: ${loginResponse.error}\n`);
        return;
      }
      
      const token = loginResponse.data.access_token;
      setResult(prev => prev + `✅ Login successful!\n\n`);
      
      // Test with only required fields
      const minimalData = {
        first_name: 'John',
        last_name: 'Doe'
      };
      
      setResult(prev => prev + `Minimal data: ${JSON.stringify(minimalData, null, 2)}\n\n`);
      
      const response = await fetch('http://localhost:8000/api/v1/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(minimalData)
      });
      
      const responseData = await response.json();
      setResult(prev => prev + `Status: ${response.status}\n`);
      setResult(prev => prev + `Response: ${JSON.stringify(responseData, null, 2)}\n`);
      
    } catch (error) {
      setResult(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
        <h1 className="text-2xl font-bold mb-6">API Testing - Client Creation</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={testClientCreation}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Client Creation (Full Data)'}
          </button>
          
          <button
            onClick={testWithMinimalData}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Client Creation (Minimal Data)'}
          </button>
        </div>
        
        {result && (
          <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}