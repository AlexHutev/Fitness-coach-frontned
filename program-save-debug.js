// Program Save Debug Tool
// Run this in browser console when on program edit page to debug save issues

function debugProgramSave() {
    console.log('🔧 Program Save Debug Tool');
    
    const currentUrl = window.location.href;
    console.log('📍 Current URL:', currentUrl);
    
    if (!currentUrl.includes('/programs/') || !currentUrl.includes('/edit')) {
        console.log('❌ Not on program edit page');
        return false;
    }
    
    // Extract program ID from URL
    const programIdMatch = currentUrl.match(/\/programs\/(\d+)\/edit/);
    const programId = programIdMatch ? programIdMatch[1] : null;
    console.log('🆔 Program ID:', programId);
    
    // Check if save button exists and is enabled
    const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent?.includes('Save') || btn.textContent?.includes('Saving')
    );
    console.log(`💾 Save buttons found: ${saveButtons.length}`);
    
    saveButtons.forEach((btn, index) => {
        console.log(`Save button ${index + 1}:`, {
            text: btn.textContent,
            disabled: btn.disabled,
            className: btn.className
        });
    });
    
    // Check authentication
    const token = localStorage.getItem('token');
    console.log('🔐 Auth token exists:', !!token);
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('🔐 Token payload:', {
                exp: new Date(payload.exp * 1000),
                expired: payload.exp * 1000 < Date.now()
            });
        } catch (e) {
            console.log('❌ Token parse error:', e.message);
        }
    }
    
    // Test API connectivity
    testApiConnectivity(programId);
    
    return {
        programId,
        saveButtonsCount: saveButtons.length,
        hasAuthToken: !!token
    };
}

async function testApiConnectivity(programId) {
    console.log('🌐 Testing API connectivity...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No auth token found');
        return;
    }
    
    try {
        // Test basic API access
        console.log('📡 Testing GET /api/v1/auth/me...');
        const meResponse = await fetch('/api/v1/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`👤 Auth check: ${meResponse.status} ${meResponse.statusText}`);
        
        if (programId) {
            // Test program access
            console.log(`📡 Testing GET /api/v1/programs/${programId}...`);
            const programResponse = await fetch(`/api/v1/programs/${programId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`📋 Program access: ${programResponse.status} ${programResponse.statusText}`);
            
            if (programResponse.ok) {
                const programData = await programResponse.json();
                console.log('📋 Program data structure:', {
                    id: programData.id,
                    name: programData.name,
                    workout_structure_length: programData.workout_structure?.length || 0,
                    hasRequiredFields: {
                        name: !!programData.name,
                        program_type: !!programData.program_type,
                        difficulty_level: !!programData.difficulty_level
                    }
                });
            } else {
                const errorText = await programResponse.text();
                console.log('❌ Program access error:', errorText);
            }
        }
        
    } catch (error) {
        console.log('❌ API connectivity error:', error.message);
    }
}

async function testProgramUpdate(programId) {
    console.log('🧪 Testing program update...');
    
    if (!programId) {
        console.log('❌ No program ID provided');
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No auth token found');
        return;
    }
    
    try {
        // First get the current program
        const getResponse = await fetch(`/api/v1/programs/${programId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!getResponse.ok) {
            console.log('❌ Failed to get program:', getResponse.status);
            return;
        }
        
        const program = await getResponse.json();
        console.log('📋 Current program:', program);
        
        // Test a minimal update
        const updateData = {
            name: program.name,
            description: program.description || 'Test update',
            program_type: program.program_type,
            difficulty_level: program.difficulty_level
        };
        
        console.log('📤 Testing update with data:', updateData);
        
        const updateResponse = await fetch(`/api/v1/programs/${programId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        console.log(`📥 Update response: ${updateResponse.status} ${updateResponse.statusText}`);
        
        if (updateResponse.ok) {
            const result = await updateResponse.json();
            console.log('✅ Update successful:', result);
        } else {
            const errorText = await updateResponse.text();
            console.log('❌ Update failed:', errorText);
        }
        
    } catch (error) {
        console.log('❌ Update test error:', error.message);
    }
}

function getFormData() {
    console.log('📝 Extracting form data...');
    
    // Get program name
    const nameInput = document.querySelector('input[placeholder*="name"], input[value*="Program"]');
    const programName = nameInput ? nameInput.value : 'Not found';
    
    // Get description
    const descTextarea = document.querySelector('textarea');
    const description = descTextarea ? descTextarea.value : 'Not found';
    
    // Get dropdowns
    const selects = document.querySelectorAll('select');
    const dropdownValues = Array.from(selects).map(select => ({
        value: select.value,
        options: Array.from(select.options).map(opt => opt.value)
    }));
    
    // Get workout structure info
    const workoutDays = document.querySelectorAll('[class*="workout"], [class*="day"]');
    
    console.log('📝 Form data extracted:', {
        programName,
        description: description.substring(0, 50) + '...',
        dropdowns: dropdownValues,
        workoutDaysCount: workoutDays.length
    });
    
    return {
        programName,
        description,
        dropdownValues,
        workoutDaysCount: workoutDays.length
    };
}

console.log('🚀 Program Save Debug Tool loaded');
console.log('Available functions:');
console.log('- debugProgramSave() - Run comprehensive save debug');
console.log('- testApiConnectivity(programId) - Test API access');
console.log('- testProgramUpdate(programId) - Test actual program update');
console.log('- getFormData() - Extract current form data');

// Auto-run if on program edit page
if (window.location.href.includes('/edit')) {
    setTimeout(() => {
        console.log('🔄 Auto-running save debug...');
        debugProgramSave();
    }, 1000);
}
