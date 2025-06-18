# How to Test Weekly Assignment → Client Profile Workflow

## Step-by-Step Testing Guide

### 1. Create a Weekly Assignment

1. Go to **Programs → Assignments** (http://localhost:3000/programs/assignments)
2. Click the **"Weekly Assignment"** tab
3. **Select Client**: Choose "Miro Hadzhiev" from the dropdown
4. **Assignment Name**: Enter a name like "Week 1 Training"
5. **Add Exercises**: 
   - Click "Add Exercise" button
   - Select exercises from the modal
   - Configure sets, reps, weight, rest time
   - Add exercises to different days (Monday, Tuesday, etc.)
6. **Create & Assign**: Click the "Create & Assign" button
7. Wait for success message

### 2. View Assignment in Client Profile

1. Go to **Clients** page (http://localhost:3000/clients)
2. Click on **"Miro Hadzhiev"** to open his profile
3. Click the **"Weekly Exercises"** tab
4. You should see the assigned exercises organized by day

### 3. If Exercises Don't Appear

**Debugging Steps:**

1. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for any error messages or API calls
   - Check the console output from our debugging code

2. **Use the Test Script**:
   - Copy the content from `test-weekly-assignment-workflow.js`
   - Paste it into the browser console
   - Run `testWeeklyAssignmentWorkflow()`

3. **Manual Refresh**:
   - Click the "Refresh" button in the Weekly Exercises tab
   - Or run `refreshWeeklyExercises()` in the console

4. **Check Assignment Status**:
   - Go back to Programs → Assignments → "All Assignments" tab
   - Verify the assignment shows as "active"
   - Check that it has the correct client assigned

5. **Check API Response**:
   - In the console, run: `checkClientAssignments(9)` (replace 9 with actual client ID)
   - This will show what assignments the API returns

### 4. Expected Results

**In Weekly Assignment Tab:**
- Client selected: "Miro Hadzhiev"
- Assignment name filled
- Exercises added to different days
- Success message after creation

**In Client Profile → Weekly Exercises Tab:**
- Program header with assignment name
- Progress tracking (0% initially)
- Days of the week with assigned exercises
- Exercise details with sets, reps, weight
- Ability to track progress and add notes

### 5. Common Issues & Solutions

**Issue**: "No Weekly Exercises" message
**Solutions**:
- Ensure assignment was created successfully
- Check that exercises were actually added to days
- Verify client ID matches (check URL: `/clients/9` means client ID 9)
- Click "Check Again" button

**Issue**: Assignment created but not showing
**Solutions**:
- Check assignment status is "active"
- Verify the `workout_structure` field has exercise data
- Use browser refresh or "Refresh" button

**Issue**: API errors in console
**Solutions**:
- Check backend server is running (http://localhost:8000)
- Verify JWT token is valid (check localStorage)
- Check network tab for failed requests

### 6. Data Structure Verification

**Assignment should have this structure:**
```json
{
  "id": 123,
  "program_name": "Week 1 Training",
  "status": "active",
  "workout_structure": [
    {
      "day": 1,
      "name": "Monday",
      "exercises": [
        {
          "exercise_id": 1,
          "exercise_name": "Bench Press",
          "sets": 3,
          "reps": "10",
          "weight": "80kg",
          "rest_seconds": 120,
          "notes": "Focus on form"
        }
      ]
    }
  ]
}
```

### 7. Debug Console Commands

Run these in the browser console for debugging:

```javascript
// Test the full workflow
testWeeklyAssignmentWorkflow()

// Refresh the weekly exercises view
refreshWeeklyExercises()

// Check assignments for specific client (replace 9 with client ID)
checkClientAssignments(9)

// Check localStorage completion data
Object.keys(localStorage).filter(key => key.includes('completion'))

// Manual API test
fetch('/api/v1/program-assignments/?client_id=9', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
}).then(r => r.json()).then(console.log)
```

### 8. Success Criteria

✅ **Assignment Creation**:
- Weekly assignment created without errors
- Client correctly selected
- Exercises added to multiple days
- Success message displayed

✅ **Client Profile Display**:
- Weekly Exercises tab visible and clickable
- Assignment appears with correct name
- Days show assigned exercises
- Progress tracking works (sets can be marked)
- Notes can be added

✅ **Data Persistence**:
- Progress saved across page refreshes
- Notes maintained in localStorage
- Assignment data loads correctly

If you follow these steps and still have issues, the debug output will help identify exactly where the problem is occurring.
