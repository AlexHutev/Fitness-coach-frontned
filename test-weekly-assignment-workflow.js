// Test script to verify Weekly Assignment to Client Profile workflow
// Run this in the browser console to test the assignment flow

async function testWeeklyAssignmentWorkflow() {
    console.log('🧪 Testing Weekly Assignment Workflow');
    
    // Step 1: Check if we're on the correct pages
    const currentUrl = window.location.href;
    console.log('📍 Current URL:', currentUrl);
    
    if (currentUrl.includes('/programs/assignments')) {
        console.log('✅ On assignments page - good for creating assignments');
        
        // Check if client is selected
        const clientSelect = document.querySelector('select[value]');
        if (clientSelect) {
            console.log('👤 Client selection found:', clientSelect.value);
        }
        
        // Check exercise data
        const exerciseData = document.querySelectorAll('[data-exercise]');
        console.log('🏋️ Exercises available:', exerciseData.length);
        
    } else if (currentUrl.includes('/clients/')) {
        console.log('✅ On client profile page - good for viewing assignments');
        
        // Check if Weekly Exercises tab exists
        const weeklyTab = document.querySelector('[aria-label="Tabs"] button:contains("Weekly Exercises")');
        if (weeklyTab) {
            console.log('✅ Weekly Exercises tab found');
        } else {
            console.log('❌ Weekly Exercises tab not found');
        }
        
        // Try to trigger the WeeklyExerciseView component refresh
        const refreshButton = document.querySelector('button:contains("Refresh")');
        if (refreshButton) {
            console.log('🔄 Refresh button found, clicking...');
            refreshButton.click();
        }
    }
    
    // Step 2: Check API endpoints
    try {
        console.log('🌐 Testing API connectivity...');
        
        // Test if we can reach the assignments API
        const response = await fetch('/api/v1/program-assignments/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API responding, assignments found:', data.length || 0);
            
            // Look for assignments with workout_structure
            const weeklyAssignments = data.filter(assignment => 
                assignment.workout_structure && 
                Array.isArray(assignment.workout_structure) &&
                assignment.workout_structure.length > 0
            );
            
            console.log('🏋️ Weekly assignments with exercises:', weeklyAssignments.length);
            
            if (weeklyAssignments.length > 0) {
                console.log('📋 Sample weekly assignment:', weeklyAssignments[0]);
            }
            
        } else {
            console.log('❌ API error:', response.status, response.statusText);
        }
        
    } catch (error) {
        console.log('❌ API request failed:', error.message);
    }
    
    // Step 3: Check localStorage for completion data
    const completionKeys = Object.keys(localStorage).filter(key => key.includes('client-') && key.includes('-completion'));
    console.log('💾 Completion data in localStorage:', completionKeys.length, 'clients');
    
    // Step 4: Provide debugging tips
    console.log('\n🔧 Debugging Tips:');
    console.log('1. Make sure you\'ve created a weekly assignment with exercises');
    console.log('2. Check that the assignment status is "active"');
    console.log('3. Verify the client ID matches between assignment and profile');
    console.log('4. Use the Refresh button in the Weekly Exercises tab');
    console.log('5. Check browser console for any error messages');
    
    return {
        url: currentUrl,
        apiConnected: true,
        completionDataKeys: completionKeys
    };
}

// Run the test
testWeeklyAssignmentWorkflow().then(result => {
    console.log('🏁 Test completed:', result);
});

// Helper function to manually refresh weekly exercises
function refreshWeeklyExercises() {
    console.log('🔄 Manually refreshing weekly exercises...');
    
    // Try to find and click the refresh button
    const buttons = Array.from(document.querySelectorAll('button'));
    const refreshButton = buttons.find(btn => btn.textContent.includes('Refresh'));
    
    if (refreshButton) {
        console.log('✅ Found refresh button, clicking...');
        refreshButton.click();
    } else {
        console.log('❌ Refresh button not found');
        console.log('Available buttons:', buttons.map(btn => btn.textContent).slice(0, 10));
    }
}

// Helper function to check assignment data for a specific client
function checkClientAssignments(clientId) {
    console.log(`🔍 Checking assignments for client ID: ${clientId}`);
    
    // Check if ProgramAssignmentService is available
    if (window.ProgramAssignmentService) {
        window.ProgramAssignmentService.getAssignments({
            client_id: clientId,
            status: 'active',
            limit: 10
        }).then(data => {
            console.log(`📊 Assignments for client ${clientId}:`, data);
            
            const weeklyAssignments = data.filter(assignment => 
                assignment.workout_structure && 
                Array.isArray(assignment.workout_structure) &&
                assignment.workout_structure.length > 0
            );
            
            console.log(`🏋️ Weekly assignments:`, weeklyAssignments);
        }).catch(error => {
            console.log(`❌ Error loading assignments:`, error);
        });
    } else {
        console.log('❌ ProgramAssignmentService not available in window scope');
    }
}

console.log('🚀 Test functions loaded:');
console.log('- testWeeklyAssignmentWorkflow()');
console.log('- refreshWeeklyExercises()');
console.log('- checkClientAssignments(clientId)');
