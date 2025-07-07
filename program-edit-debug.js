// Program Edit Debug Script
// This script helps diagnose program editing issues

async function debugProgramEdit() {
  console.log('🔍 Starting Program Edit Debug...');
  
  try {
    // Test authentication
    console.log('1. Testing authentication...');
    const authResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'trainer@fitnesscoach.com',
        password: 'trainer123'
      })
    });
    
    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status}`);
    }
    
    const authData = await authResponse.json();
    const token = authData.access_token;
    console.log('✅ Authentication successful');
    
    // Test getting programs
    console.log('2. Getting programs...');
    const programsResponse = await fetch('http://localhost:8000/api/v1/programs/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!programsResponse.ok) {
      throw new Error(`Programs fetch failed: ${programsResponse.status}`);
    }
    
    const programs = await programsResponse.json();
    console.log('✅ Programs fetched:', programs.length);
    
    if (programs.length === 0) {
      console.log('⚠️  No programs found, creating a test program...');
      
      // Create a test program
      const testProgram = {
        name: 'Debug Test Program',
        description: 'A test program for debugging',
        program_type: 'strength',
        difficulty_level: 'beginner',
        duration_weeks: 4,
        sessions_per_week: 3,
        workout_structure: [
          {
            day: 1,
            name: 'Day 1 - Upper Body',
            exercises: [
              {
                exercise_id: 1,
                sets: 3,
                reps: '10',
                weight: 'bodyweight',
                rest_seconds: 60,
                notes: 'Focus on form'
              }
            ]
          }
        ],
        tags: 'debug test',
        equipment_needed: ['none'],
        is_template: true
      };
      
      const createResponse = await fetch('http://localhost:8000/api/v1/programs/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testProgram)
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`Program creation failed: ${createResponse.status} - ${errorText}`);
      }
      
      const createdProgram = await createResponse.json();
      console.log('✅ Test program created:', createdProgram.id);
      programs.push(createdProgram);
    }
    
    // Test getting a specific program
    const testProgramId = programs[0].id;
    console.log('3. Getting specific program:', testProgramId);
    
    const programResponse = await fetch(`http://localhost:8000/api/v1/programs/${testProgramId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!programResponse.ok) {
      throw new Error(`Program fetch failed: ${programResponse.status}`);
    }
    
    const program = await programResponse.json();
    console.log('✅ Program fetched:', program.name);
    console.log('📊 Workout structure:', program.workout_structure);
    
    // Test updating the program with an exercise addition
    console.log('4. Testing program update with exercise addition...');
    
    // Add a new exercise to the first day
    const updatedWorkoutStructure = [...program.workout_structure];
    if (updatedWorkoutStructure.length > 0) {
      updatedWorkoutStructure[0].exercises.push({
        exercise_id: 2,
        sets: 4,
        reps: '12',
        weight: '20kg',
        rest_seconds: 90,
        notes: 'New exercise added for testing'
      });
    }
    
    const updateData = {
      name: program.name,
      description: program.description,
      program_type: program.program_type,
      difficulty_level: program.difficulty_level,
      duration_weeks: program.duration_weeks,
      sessions_per_week: program.sessions_per_week,
      workout_structure: updatedWorkoutStructure,
      tags: program.tags,
      equipment_needed: program.equipment_needed,
      is_template: program.is_template,
      is_active: program.is_active
    };
    
    console.log('📝 Update data:', JSON.stringify(updateData, null, 2));
    
    const updateResponse = await fetch(`http://localhost:8000/api/v1/programs/${testProgramId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Update failed:', updateResponse.status, errorText);
      
      // Try to parse the error
      try {
        const errorJson = JSON.parse(errorText);
        console.error('📄 Error details:', errorJson);
      } catch (e) {
        console.error('📄 Raw error:', errorText);
      }
      
      throw new Error(`Program update failed: ${updateResponse.status}`);
    }
    
    const updatedProgram = await updateResponse.json();
    console.log('✅ Program updated successfully!');
    console.log('📊 Updated workout structure:', updatedProgram.workout_structure);
    
    // Verify the update persisted
    console.log('5. Verifying update persisted...');
    const verifyResponse = await fetch(`http://localhost:8000/api/v1/programs/${testProgramId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!verifyResponse.ok) {
      throw new Error(`Verify fetch failed: ${verifyResponse.status}`);
    }
    
    const verifiedProgram = await verifyResponse.json();
    console.log('✅ Verification successful');
    console.log('📊 Persisted workout structure:', verifiedProgram.workout_structure);
    
    // Check if the new exercise was added
    const firstDay = verifiedProgram.workout_structure[0];
    if (firstDay && firstDay.exercises.length >= 2) {
      console.log('✅ Exercise addition confirmed! Exercise count:', firstDay.exercises.length);
    } else {
      console.log('⚠️  Exercise addition may not have persisted properly');
    }
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('💥 Debug failed:', error.message);
    console.error('📊 Error details:', error);
  }
}

// Run the debug
debugProgramEdit();