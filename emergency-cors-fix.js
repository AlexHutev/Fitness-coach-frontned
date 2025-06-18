// Emergency CORS and Token Fix
// Run this in browser console to fix the immediate save issue

function emergencyFix() {
    console.log('🚨 Emergency CORS and Token Fix');
    
    // Check all possible token keys
    const tokenKeys = ['token', 'auth_token', 'access_token', 'authToken', 'jwt_token'];
    const foundTokens = {};
    
    tokenKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            foundTokens[key] = value.substring(0, 20) + '...';
        }
    });
    
    console.log('🔍 Found tokens:', foundTokens);
    
    // Check which token key has a valid JWT
    let workingToken = null;
    let workingKey = null;
    
    tokenKeys.forEach(key => {
        const token = localStorage.getItem(key);
        if (token && token.includes('.')) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp && payload.exp * 1000 > Date.now()) {
                    workingToken = token;
                    workingKey = key;
                    console.log(`✅ Valid token found in '${key}':`, {
                        expires: new Date(payload.exp * 1000),
                        user: payload.sub || payload.email || 'unknown'
                    });
                }
            } catch (e) {
                console.log(`❌ Invalid token in '${key}':`, e.message);
            }
        }
    });
    
    if (workingToken && workingKey !== 'auth_token') {
        console.log(`🔧 Copying token from '${workingKey}' to 'auth_token'`);
        localStorage.setItem('auth_token', workingToken);
    }
    
    // Test API connectivity with the correct token
    return testApiWithToken(workingToken);
}

async function testApiWithToken(token) {
    if (!token) {
        console.log('❌ No valid token found');
        return false;
    }
    
    console.log('🧪 Testing API with token...');
    
    try {
        // Test auth endpoint
        const authResponse = await fetch('http://localhost:8000/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`👤 Auth test: ${authResponse.status} ${authResponse.statusText}`);
        
        if (authResponse.ok) {
            const userData = await authResponse.json();
            console.log('✅ Auth successful:', userData);
            
            // Test program update
            return testProgramUpdate(token);
        } else {
            const errorText = await authResponse.text();
            console.log('❌ Auth failed:', errorText);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Network error:', error.message);
        
        // If CORS error, try to bypass by using alternative approach
        if (error.message.includes('CORS') || error.message.includes('fetch')) {
            console.log('🔧 CORS error detected, trying alternative approach...');
            return await tryCorsWorkaround(token);
        }
        
        return false;
    }
}

async function testProgramUpdate(token) {
    console.log('🧪 Testing program update...');
    
    const programId = window.location.pathname.match(/\/programs\/(\d+)/)[1];
    
    try {
        // First get the program
        const getResponse = await fetch(`http://localhost:8000/api/v1/programs/${programId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📋 Get program: ${getResponse.status} ${getResponse.statusText}`);
        
        if (!getResponse.ok) {
            const errorText = await getResponse.text();
            console.log('❌ Get program failed:', errorText);
            return false;
        }
        
        const program = await getResponse.json();
        console.log('📋 Program data:', program);
        
        // Try a minimal update
        const updateData = {
            name: program.name,
            description: program.description || 'Updated via emergency fix',
            program_type: program.program_type,
            difficulty_level: program.difficulty_level
        };
        
        const updateResponse = await fetch(`http://localhost:8000/api/v1/programs/${programId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        console.log(`📤 Update program: ${updateResponse.status} ${updateResponse.statusText}`);
        
        if (updateResponse.ok) {
            const result = await updateResponse.json();
            console.log('✅ Update successful:', result);
            alert('✅ Program save fix successful! Try saving your program again.');
            return true;
        } else {
            const errorText = await updateResponse.text();
            console.log('❌ Update failed:', errorText);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Program update error:', error.message);
        return false;
    }
}

async function tryCorsWorkaround(token) {
    console.log('🔧 Attempting CORS workaround...');
    
    // Check if backend is running
    try {
        const healthResponse = await fetch('http://localhost:8000/', {
            method: 'GET',
            mode: 'no-cors'
        });
        console.log('🏥 Backend seems to be running');
        
        // The main issue is likely CORS configuration
        // Show instructions to fix it
        console.log('📋 To fix CORS:');
        console.log('1. Check if backend server is running on localhost:8000');
        console.log('2. Restart the backend server');
        console.log('3. Make sure CORS is configured for localhost:3000');
        
        return false;
        
    } catch (error) {
        console.log('❌ Backend not accessible:', error.message);
        console.log('🔧 Please start the backend server:');
        console.log('   cd C:\\university\\fitness-coach');
        console.log('   python -m uvicorn app.main:app --reload --port 8000');
        return false;
    }
}

function fixTokenStorage() {
    console.log('🔧 Fixing token storage...');
    
    // Common token keys to check
    const tokenKeys = ['token', 'auth_token', 'access_token', 'authToken'];
    
    // Find any valid token
    let foundToken = null;
    let sourceKey = null;
    
    tokenKeys.forEach(key => {
        const token = localStorage.getItem(key);
        if (token && token.length > 20 && !foundToken) {
            foundToken = token;
            sourceKey = key;
        }
    });
    
    if (foundToken) {
        // Set it in all possible locations
        localStorage.setItem('auth_token', foundToken);
        localStorage.setItem('token', foundToken);
        console.log(`✅ Token copied from '${sourceKey}' to standard locations`);
        return foundToken;
    } else {
        console.log('❌ No token found - please log in again');
        return null;
    }
}

console.log('🚨 Emergency Fix Loaded');
console.log('Available functions:');
console.log('- emergencyFix() - Comprehensive fix attempt');
console.log('- fixTokenStorage() - Fix token storage keys');
console.log('- testApiWithToken(token) - Test API with specific token');

// Auto-run
emergencyFix();
