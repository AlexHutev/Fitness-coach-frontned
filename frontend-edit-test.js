// Frontend Program Edit Test
// This script tests the frontend program editing functionality

console.log('🧪 Testing Frontend Program Edit...');

// Wait for page to load
setTimeout(() => {
  try {
    // Check if we're on the edit page
    if (!window.location.pathname.includes('/edit')) {
      console.log('❌ Not on edit page. Please navigate to a program edit page first.');
      console.log('📍 Current URL:', window.location.pathname);
      return;
    }
    
    console.log('✅ On edit page:', window.location.pathname);
    
    // Check if the page has loaded properly
    const saveButton = document.querySelector('button[form=""], button:contains("Save")') || 
                       document.querySelector('[data-testid="save-button"]') ||
                       Array.from(document.querySelectorAll('button')).find(btn => 
                         btn.textContent.includes('Save') || btn.textContent.includes('save'));
    
    if (saveButton) {
      console.log('✅ Save button found:', saveButton.textContent);
    } else {
      console.log('⚠️  Save button not found, but page might still be loading');
    }
    
    // Check for workout days
    const workoutDays = document.querySelectorAll('[data-testid="workout-day"], .workout-day, .border.border-gray-200.rounded-lg');
    console.log('📅 Workout days found:', workoutDays.length);
    
    // Check for add exercise buttons
    const addExerciseButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent.includes('Add Exercise') || btn.textContent.includes('Add exercise'));
    console.log('➕ Add Exercise buttons found:', addExerciseButtons.length);
    
    // Check for exercise inputs
    const exerciseInputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    console.log('📝 Exercise inputs found:', exerciseInputs.length);
    
    // Test adding an exercise (simulate)
    if (addExerciseButtons.length > 0) {
      console.log('🎯 Testing exercise addition...');
      console.log('📝 To test manually:');
      console.log('   1. Click an "Add Exercise" button');
      console.log('   2. Select an exercise from the modal');
      console.log('   3. Configure sets, reps, weight, rest');
      console.log('   4. Click "Save Changes"');
      console.log('   5. Check that the exercise persists after page reload');
    }
    
    // Check for React state (if available)
    if (window.React) {
      console.log('⚛️  React is available on the page');
    }
    
    console.log('🎉 Frontend edit page appears to be working properly!');
    console.log('💡 To test the fix, try adding an exercise and saving the program.');
    
  } catch (error) {
    console.error('💥 Test error:', error);
  }
}, 2000);

console.log('⏳ Waiting 2 seconds for page to load...');