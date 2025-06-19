// Frontend API call simulation to verify the fix
import { apiClient, API_ENDPOINTS } from '@/lib/api';

// This simulates how the frontend calls the client creation API
const testClientCreation = async () => {
  try {
    const clientData = {
      first_name: "Frontend",
      last_name: "Test", 
      email: "frontendtest@example.com",
      phone_number: "9876543210",
      custom_password: "frontend123"
    };

    console.log('Making API call...');
    const response = await apiClient.post(
      `${API_ENDPOINTS.CLIENTS}/with-account`,
      clientData
    );

    console.log('Response structure:', {
      hasData: !!response.data,
      hasError: !!response.error,
      status: response.status,
      dataKeys: response.data ? Object.keys(response.data) : []
    });

    if (response.error) {
      console.log('API Error:', response.error);
      return;
    }

    if (response.data) {
      console.log('Success! Response data structure:', {
        hasClient: !!response.data.client,
        hasUserAccount: !!response.data.user_account,
        hasMessage: !!response.data.message,
        email: response.data.user_account?.email,
        tempPassword: response.data.user_account?.temporary_password
      });
    }

  } catch (error) {
    console.error('Caught error:', error);
  }
};

// This would be called in a browser environment where apiClient has auth token
console.log('This simulation shows the expected frontend API response structure');
