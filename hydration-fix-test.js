// Hydration Issue Fix Test Script
// Run this in the browser console to check for hydration issues

function checkHydrationIssues() {
    console.log('🔍 Checking for hydration issues...');
    
    // Check for React hydration warnings in console
    const originalConsoleError = console.error;
    const hydrationErrors = [];
    
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('hydration') || message.includes('Hydration')) {
            hydrationErrors.push(message);
        }
        originalConsoleError.apply(console, args);
    };
    
    // Check for common hydration issue indicators
    const checks = {
        duplicateIds: checkDuplicateIds(),
        invalidNesting: checkInvalidNesting(),
        clientOnlyComponents: checkClientOnlyComponents(),
        dateFormatting: checkDateFormatting()
    };
    
    console.log('✅ Hydration checks completed:', checks);
    
    if (hydrationErrors.length > 0) {
        console.warn('❌ Hydration errors found:', hydrationErrors);
    } else {
        console.log('✅ No hydration errors detected');
    }
    
    return { checks, hydrationErrors };
}

function checkDuplicateIds() {
    const elements = document.querySelectorAll('[id]');
    const ids = Array.from(elements).map(el => el.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    
    if (duplicates.length > 0) {
        console.warn('❌ Duplicate IDs found:', duplicates);
        return false;
    }
    return true;
}

function checkInvalidNesting() {
    // Check for invalid HTML nesting (common cause of hydration issues)
    const invalidNesting = [];
    
    // Check for <div> inside <p>
    const paragraphs = document.querySelectorAll('p');
    paragraphs.forEach(p => {
        if (p.querySelector('div')) {
            invalidNesting.push('div inside p');
        }
    });
    
    // Check for block elements inside inline elements
    const spans = document.querySelectorAll('span');
    spans.forEach(span => {
        if (span.querySelector('div, p, h1, h2, h3, h4, h5, h6')) {
            invalidNesting.push('block element inside span');
        }
    });
    
    if (invalidNesting.length > 0) {
        console.warn('❌ Invalid HTML nesting found:', invalidNesting);
        return false;
    }
    return true;
}

function checkClientOnlyComponents() {
    // Check if components that should be client-only are properly marked
    const url = window.location.href;
    
    if (url.includes('/programs/')) {
        // Check if program components have proper client-side rendering
        const programElements = document.querySelectorAll('[data-program], .program-component');
        if (programElements.length === 0) {
            console.warn('⚠️ Program components not found - may be loading');
        }
    }
    
    return true;
}

function checkDateFormatting() {
    // Check for date formatting that might differ between server and client
    const dateElements = document.querySelectorAll('[data-date], .date');
    let hasIssues = false;
    
    dateElements.forEach(el => {
        const text = el.textContent;
        if (text && text.includes('Invalid Date')) {
            console.warn('❌ Invalid date found:', text);
            hasIssues = true;
        }
    });
    
    return !hasIssues;
}

// Function to monitor for new hydration errors
function monitorHydrationErrors() {
    console.log('🔧 Starting hydration error monitoring...');
    
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('hydration') || message.includes('Hydration')) {
            console.log('🚨 HYDRATION ERROR DETECTED:', message);
            console.trace('Error location:');
        }
        originalConsoleError.apply(console, args);
    };
    
    console.warn = function(...args) {
        const message = args.join(' ');
        if (message.includes('hydration') || message.includes('Hydration')) {
            console.log('⚠️ HYDRATION WARNING:', message);
        }
        originalConsoleWarn.apply(console, args);
    };
    
    console.log('✅ Hydration monitoring active');
}

// Function to test specific problematic areas
function testProgramPages() {
    console.log('🧪 Testing program pages for hydration issues...');
    
    const currentUrl = window.location.href;
    
    if (currentUrl.includes('/programs/')) {
        // Test table rendering
        const tables = document.querySelectorAll('table');
        console.log(`📊 Found ${tables.length} tables`);
        
        tables.forEach((table, index) => {
            const thead = table.querySelector('thead');
            const tbody = table.querySelector('tbody');
            
            if (!thead || !tbody) {
                console.warn(`❌ Table ${index} missing thead or tbody`);
            } else {
                console.log(`✅ Table ${index} structure OK`);
            }
        });
        
        // Test for proper component mounting
        const buttons = document.querySelectorAll('button');
        console.log(`🔘 Found ${buttons.length} buttons`);
        
        // Test for proper loading states
        const loadingIndicators = document.querySelectorAll('.animate-spin');
        if (loadingIndicators.length > 0) {
            console.log(`⏳ Found ${loadingIndicators.length} loading indicators - components may still be loading`);
        }
    }
    
    return {
        url: currentUrl,
        tablesFound: document.querySelectorAll('table').length,
        buttonsFound: document.querySelectorAll('button').length,
        loadingIndicators: document.querySelectorAll('.animate-spin').length
    };
}

// Auto-run basic checks
console.log('🚀 Hydration fix verification loaded');
console.log('Available functions:');
console.log('- checkHydrationIssues()');
console.log('- monitorHydrationErrors()');
console.log('- testProgramPages()');

// Auto-run if we're on a program page
if (window.location.href.includes('/programs/')) {
    setTimeout(() => {
        console.log('🔄 Auto-running hydration checks for program page...');
        checkHydrationIssues();
        testProgramPages();
    }, 1000);
}
