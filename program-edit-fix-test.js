// Fix verification script for WorkoutDayEditor error
// Run this in browser console to test the program edit page

function testProgramEditFix() {
    console.log('🧪 Testing Program Edit Fix...');
    
    const currentUrl = window.location.href;
    console.log('📍 Current URL:', currentUrl);
    
    if (!currentUrl.includes('/programs/') || !currentUrl.includes('/edit')) {
        console.log('❌ Not on program edit page. Navigate to a program edit page first.');
        console.log('📍 Example: http://localhost:3000/programs/3/edit');
        return false;
    }
    
    // Check for React errors
    const errors = [];
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('WorkoutDayEditor') || message.includes('not defined')) {
            errors.push(message);
        }
        originalConsoleError.apply(console, args);
    };
    
    // Check if components are rendering
    setTimeout(() => {
        console.log('🔍 Checking for components...');
        
        // Check for WorkoutDayEditor components
        const workoutDays = document.querySelectorAll('[class*="workout"], [class*="day"]');
        console.log(`📅 Found ${workoutDays.length} potential workout day elements`);
        
        // Check for exercise editing elements
        const exerciseInputs = document.querySelectorAll('input[type="number"], input[placeholder*="rep"], input[placeholder*="weight"]');
        console.log(`🏋️ Found ${exerciseInputs.length} exercise configuration inputs`);
        
        // Check for add exercise buttons
        const addButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent?.includes('Add Exercise') || btn.textContent?.includes('Add Day')
        );
        console.log(`➕ Found ${addButtons.length} add buttons`);
        
        // Check for save functionality
        const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent?.includes('Save') || btn.textContent?.includes('Update')
        );
        console.log(`💾 Found ${saveButtons.length} save buttons`);
        
        if (errors.length > 0) {
            console.log('❌ Errors found:', errors);
            return false;
        } else {
            console.log('✅ No WorkoutDayEditor errors detected!');
            
            if (workoutDays.length > 0 || exerciseInputs.length > 0) {
                console.log('✅ Program edit components appear to be rendering correctly');
                return true;
            } else {
                console.log('⚠️ Components may still be loading...');
                return 'loading';
            }
        }
    }, 1000);
    
    return 'testing';
}

// Helper function to check specific component functionality
function testWorkoutDayEditor() {
    console.log('🧪 Testing WorkoutDayEditor specific functionality...');
    
    // Look for workout day containers
    const dayContainers = Array.from(document.querySelectorAll('div')).filter(div => {
        const text = div.textContent || '';
        return text.includes('Day ') && text.includes('exercise');
    });
    
    console.log(`📅 Found ${dayContainers.length} day containers`);
    
    // Look for exercise configuration inputs
    const setInputs = document.querySelectorAll('input[type="number"]');
    const repInputs = Array.from(document.querySelectorAll('input')).filter(input => 
        input.placeholder?.includes('rep') || input.placeholder?.includes('10')
    );
    const weightInputs = Array.from(document.querySelectorAll('input')).filter(input => 
        input.placeholder?.includes('weight') || input.placeholder?.includes('kg')
    );
    
    console.log(`🔢 Exercise config inputs found:`, {
        sets: setInputs.length,
        reps: repInputs.length,
        weights: weightInputs.length
    });
    
    // Test if we can interact with inputs
    if (setInputs.length > 0) {
        console.log('✅ Exercise configuration inputs are present');
        return true;
    } else {
        console.log('⚠️ No exercise configuration inputs found - program may be empty or still loading');
        return false;
    }
}

// Helper function to simulate adding an exercise
function testAddExercise() {
    console.log('🧪 Testing Add Exercise functionality...');
    
    const addExerciseButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent?.includes('Add Exercise')
    );
    
    if (addExerciseButtons.length > 0) {
        console.log(`➕ Found ${addExerciseButtons.length} "Add Exercise" buttons`);
        console.log('ℹ️ You can click one to test the exercise selector modal');
        return addExerciseButtons;
    } else {
        console.log('❌ No "Add Exercise" buttons found');
        return [];
    }
}

console.log('🚀 Program Edit Fix Test Loaded');
console.log('Available functions:');
console.log('- testProgramEditFix() - Check if the fix worked');
console.log('- testWorkoutDayEditor() - Test specific component functionality');
console.log('- testAddExercise() - Test add exercise functionality');

// Auto-run if on program edit page
if (window.location.href.includes('/edit')) {
    console.log('🔄 Auto-running program edit fix test...');
    testProgramEditFix();
}
