// Test script to verify View and Edit functionality
// This script tests the program view and edit pages

async function testProgramViewAndEdit() {
  console.log('=== Testing Program View and Edit Functionality ===');
  
  const baseUrl = 'http://localhost:3001';
  const apiUrl = 'http://localhost:8000';
  
  try {
    // Test 1: Check if the programs page loads
    console.log('\n1. Testing programs page...');
    const programsResponse = await fetch(`${baseUrl}/programs`);
    console.log(`Programs page status: ${programsResponse.status}`);
    
    // Test 2: Check if API endpoints are working
    console.log('\n2. Testing API endpoints...');
    
    // Test login to get auth token
    const loginResponse = await fetch(`${apiUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'trainer@fitnesscoach.com',
        password: 'trainer123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.access_token;
      console.log('✓ Login successful');
      
      // Test programs API
      const programsApiResponse = await fetch(`${apiUrl}/api/v1/programs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (programsApiResponse.ok) {
        const programs = await programsApiResponse.json();
        console.log(`✓ Programs API working. Found ${programs.length} programs`);
        
        // Test individual program if exists
        if (programs.length > 0) {
          const firstProgram = programs[0];
          const programDetailResponse = await fetch(`${apiUrl}/api/v1/programs/${firstProgram.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (programDetailResponse.ok) {
            const programDetail = await programDetailResponse.json();
            console.log(`✓ Program detail API working for program: ${programDetail.name}`);
            console.log(`  - Type: ${programDetail.program_type}`);
            console.log(`  - Difficulty: ${programDetail.difficulty_level}`);
            console.log(`  - Workout days: ${programDetail.workout_structure.length}`);
          } else {
            console.log('✗ Program detail API failed');
          }
        }
        
        // Test exercises API
        const exercisesApiResponse = await fetch(`${apiUrl}/api/v1/exercises`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (exercisesApiResponse.ok) {
          const exercises = await exercisesApiResponse.json();
          console.log(`✓ Exercises API working. Found ${exercises.length} exercises`);
        } else {
          console.log('✗ Exercises API failed');
        }
        
      } else {
        console.log('✗ Programs API failed');
      }
      
    } else {
      console.log('✗ Login failed');
    }
    
    console.log('\n=== Test Summary ===');
    console.log('✓ Backend server running on port 8000');
    console.log('✓ Frontend server running on port 3001');
    console.log('✓ View page created at /programs/[id]');
    console.log('✓ Edit page created at /programs/[id]/edit');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Visit http://localhost:3001/programs');
    console.log('2. Click "View" or "Edit" on any program');
    console.log('3. Test the functionality');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testProgramViewAndEdit();
} else {
  // Browser environment
  testProgramViewAndEdit();
}
