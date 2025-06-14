#!/usr/bin/env node

/**
 * Integration test script to verify frontend-backend connection
 */

const https = require('http');

const API_BASE_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:3000';

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        const status = response.statusCode;
        console.log(`✅ ${description}: ${status} ${status < 400 ? '(SUCCESS)' : '(ERROR)'}`);
        if (status < 400) {
          try {
            const json = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(json).substring(0, 100)}...`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...`);
          }
        }
        resolve(status < 400);
      });
    });
    
    request.on('error', (error) => {
      console.log(`❌ ${description}: ERROR - ${error.message}`);
      resolve(false);
    });
    
    request.setTimeout(5000, () => {
      console.log(`❌ ${description}: TIMEOUT`);
      request.destroy();
      resolve(false);
    });
  });
}

async function testLogin() {
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      email: 'trainer@fitnesscoach.com',
      password: 'trainer123'
    });

    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        const status = response.statusCode;
        console.log(`✅ Login Test: ${status} ${status === 200 ? '(SUCCESS)' : '(ERROR)'}`);
        if (status === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`   Token received: ${json.access_token ? 'YES' : 'NO'}`);
            console.log(`   Token type: ${json.token_type}`);
          } catch (e) {
            console.log(`   Response: ${data}`);
          }
        } else {
          console.log(`   Error: ${data}`);
        }
        resolve(status === 200);
      });
    });

    request.on('error', (error) => {
      console.log(`❌ Login Test: ERROR - ${error.message}`);
      resolve(false);
    });

    request.write(loginData);
    request.end();
  });
}

async function runTests() {
  console.log('🚀 Testing FitnessCoach Frontend-Backend Integration');
  console.log('=' * 60);
  
  // Test backend endpoints
  console.log('\n📡 Backend API Tests:');
  await testEndpoint(`${API_BASE_URL}/`, 'Root endpoint');
  await testEndpoint(`${API_BASE_URL}/api/v1/health`, 'Health check');
  await testEndpoint(`${API_BASE_URL}/docs`, 'API documentation');
  
  // Test authentication
  console.log('\n🔐 Authentication Tests:');
  await testLogin();
  
  // Test frontend
  console.log('\n🖥️  Frontend Tests:');
  await testEndpoint(`${FRONTEND_URL}/`, 'Frontend homepage');
  await testEndpoint(`${FRONTEND_URL}/auth/login`, 'Login page');
  await testEndpoint(`${FRONTEND_URL}/auth/register`, 'Register page');
  
  console.log('\n✅ Integration test completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Open http://localhost:3000 in your browser');
  console.log('   2. Try logging in with: trainer@fitnesscoach.com / trainer123');
  console.log('   3. Test the registration form');
  console.log('   4. Check the API docs at: http://localhost:8000/docs');
}

runTests().catch(console.error);
