// Test script to debug login issues
const fetch = require('node-fetch');

async function testLogin() {
  console.log('Testing login endpoint...');
  
  const loginData = {
    email: 'trainer@fitnesscoach.com',
    password: 'trainer123'
  };
  
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Login successful!');
      console.log('Token:', data.access_token);
      
      // Test getting user data
      console.log('\nTesting user data endpoint...');
      const userResponse = await fetch('http://localhost:8000/api/v1/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User data:', userData);
      } else {
        console.log('Error getting user data:', userResponse.status);
        const errorText = await userResponse.text();
        console.log('Error details:', errorText);
      }
      
    } else {
      console.log('Login failed!');
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
}

testLogin();
