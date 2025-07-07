import React, { useState, useEffect } from 'react';
import { ProgramService } from '@/services/programs';
import { ClientService } from '@/services/clients';
import { ExerciseService } from '@/services/exercises';
import { ProgramAssignmentService } from '@/services/program-assignments';
import { ProgramList, ClientSummary, Exercise, ExerciseList } from '@/types/api';

interface WeeklyAssignmentProps {
  onAssignmentComplete?: () => void;
  preselectedClientId?: number;
}

interface ExerciseWithConfig {
  exercise: ExerciseList;
  sets: number;
  reps: string;
  weight: string;
  rest_seconds: number;
  notes: string;
}

interface WorkoutDay {
  day: number;
  name: string;
  exercises: {
    exercise_id: number;
    exercise_name: string;
    sets: number;
    reps: string;
    weight: string;
    rest_seconds: number;
    notes?: string;
  }[];
}

export default function WeeklyAssignment({ 
  onAssignmentComplete,
  preselectedClientId
}: WeeklyAssignmentProps) {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [exercises, setExercises] = useState<ExerciseList[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(preselectedClientId || null);
  const [assignmentName, setAssignmentName] = useState<string>('');
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<WorkoutDay[]>([
    { day: 1, name: 'Monday', exercises: [] },
    { day: 2, name: 'Tuesday', exercises: [] },
    { day: 3, name: 'Wednesday', exercises: [] },
    { day: 4, name: 'Thursday', exercises: [] },
    { day: 5, name: 'Friday', exercises: [] },
    { day: 6, name: 'Saturday', exercises: [] },
    { day: 7, name: 'Sunday', exercises: [] }
  ]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExerciseForConfig, setSelectedExerciseForConfig] = useState<ExerciseList | null>(null);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
  const [exerciseConfig, setExerciseConfig] = useState<{
    sets: number;
    reps: string;
    weight: string;
    rest_seconds: number;
    notes: string;
  }>({
    sets: 3,
    reps: '10',
    weight: 'bodyweight',
    rest_seconds: 60,
    notes: ''
  });

  useEffect(() => {
    console.log('🚀 WeeklyAssignment useEffect triggered');
    loadData();
  }, []);

  const loadData = async () => {
    console.log('📊 loadData function called');
    setIsLoading(true);
    setError('');
    try {
      console.log('🔄 Starting API calls...');
      const [clientsData, exercises] = await Promise.all([
        ClientService.getClients(),
        ExerciseService.getExercises({ limit: 100 }) // API max limit is 100
      ]);
      console.log('✅ API calls completed');
      
      if (clientsData && Array.isArray(clientsData)) {
        setClients(clientsData.filter(client => client.is_active));
        console.log(`Loaded ${clientsData.length} clients`);
      }
      
      if (exercises && Array.isArray(exercises)) {
        setExercises(exercises);
        console.log(`✅ Loaded ${exercises.length} exercises:`, exercises.slice(0, 3)); // Show first 3 exercises
      } else {
        console.error('❌ Unexpected exercises response structure:', exercises);
        setError('Failed to load exercises - unexpected response format');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const selectExerciseForConfiguration = (exercise: ExerciseList) => {
    setSelectedExerciseForConfig(exercise);
    setExerciseConfig({
      sets: 3,
      reps: '10',
      weight: 'bodyweight',
      rest_seconds: 60,
      notes: ''
    });
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()) ||
    (exercise.muscle_groups && exercise.muscle_groups.some((mg: string) => 
      mg.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
    ))
  );

  // Debug logging
  console.log(`🔍 Filter Debug: exercises.length=${exercises.length}, searchTerm="${exerciseSearchTerm}", filteredExercises.length=${filteredExercises.length}`);

  const addExerciseToDay = () => {
    if (!selectedExerciseForConfig) return;
    
    setWeeklyWorkouts(prev => prev.map(day => 
      day.day === selectedDay ? {
        ...day,
        exercises: [...day.exercises, {
          exercise_id: selectedExerciseForConfig.id,
          exercise_name: selectedExerciseForConfig.name,
          sets: exerciseConfig.sets,
          reps: exerciseConfig.reps,
          weight: exerciseConfig.weight,
          rest_seconds: exerciseConfig.rest_seconds,
          notes: exerciseConfig.notes
        }]
      } : day
    ));
    
    setShowExerciseModal(false);
    setSelectedExerciseForConfig(null);
    setExerciseSearchTerm('');
  };

  const updateExercise = (dayNumber: number, exerciseIndex: number, field: string, value: any) => {
    setWeeklyWorkouts(prev => prev.map(day => 
      day.day === dayNumber ? {
        ...day,
        exercises: day.exercises.map((ex, idx) => 
          idx === exerciseIndex ? { ...ex, [field]: value } : ex
        )
      } : day
    ));
  };

  const removeExercise = (dayNumber: number, exerciseIndex: number) => {
    setWeeklyWorkouts(prev => prev.map(day => 
      day.day === dayNumber ? {
        ...day,
        exercises: day.exercises.filter((_, idx) => idx !== exerciseIndex)
      } : day
    ));
  };

  const createProgramAndAssign = async () => {
    if (!selectedClientId || !assignmentName.trim()) {
      setError('Please select a client and enter an assignment name');
      return;
    }

    const hasExercises = weeklyWorkouts.some(day => day.exercises.length > 0);
    if (!hasExercises) {
      setError('Please add at least one exercise to the weekly schedule');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create a new program with the weekly structure
      const programData = {
        name: assignmentName,
        description: `Custom weekly program for client`,
        program_type: 'mixed',
        difficulty_level: 'intermediate',
        duration_weeks: 4,
        sessions_per_week: weeklyWorkouts.filter(day => day.exercises.length > 0).length,
        workout_structure: weeklyWorkouts.filter(day => day.exercises.length > 0)
      };

      const programResponse = await ProgramService.createProgram(programData);
      
      if (programResponse.data) {
        // Now assign this program to the client
        const assignments = await ProgramAssignmentService.assignProgram(
          programResponse.data.id,
          [selectedClientId],
          new Date().toISOString(),
          `Custom weekly assignment: ${assignmentName}`
        );

        alert(`Successfully created and assigned weekly program!`);
        
        // Reset form
        setAssignmentName('');
        setWeeklyWorkouts(prev => prev.map(day => ({ ...day, exercises: [] })));
        setSelectedClientId(preselectedClientId || null);

        if (onAssignmentComplete) {
          onAssignmentComplete();
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create assignment';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const currentDayWorkout = weeklyWorkouts.find(day => day.day === selectedDay);

  if (isLoading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Weekly Exercise Assignment</h2>
        <button 
          onClick={loadData}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : `Reload Data (${exercises.length} exercises)`}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Selection and Assignment Name */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Client
            </label>
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(Number(e.target.value) || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!preselectedClientId}
            >
              <option value="">Choose a client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Name
            </label>
            <input
              type="text"
              value={assignmentName}
              onChange={(e) => setAssignmentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Week 1 Strength Training"
            />
          </div>

          {/* Week Overview */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Week Overview</h3>
            <div className="space-y-2">
              {weeklyWorkouts.map(day => (
                <div
                  key={day.day}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedDay === day.day 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDay(day.day)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{day.name}</span>
                    <span className="text-sm text-gray-500">
                      {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Day-specific Exercise Planning */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {currentDayWorkout?.name} Exercises
            </h3>
            <button
              onClick={() => setShowExerciseModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Exercise
            </button>
          </div>

          <div className="space-y-4">
            {currentDayWorkout?.exercises.map((exercise, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900">{exercise.exercise_name}</h4>
                  <button
                    onClick={() => removeExercise(selectedDay, index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sets</label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(selectedDay, index, 'sets', parseInt(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reps</label>
                    <input
                      type="text"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(selectedDay, index, 'reps', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="10 or 8-12"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Weight</label>
                    <input
                      type="text"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(selectedDay, index, 'weight', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="60kg or bodyweight"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rest (sec)</label>
                    <input
                      type="number"
                      min="10"
                      value={exercise.rest_seconds}
                      onChange={(e) => updateExercise(selectedDay, index, 'rest_seconds', parseInt(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={exercise.notes || ''}
                    onChange={(e) => updateExercise(selectedDay, index, 'notes', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Form cues, modifications, etc."
                  />
                </div>
              </div>
            ))}
            
            {currentDayWorkout?.exercises.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No exercises added for {currentDayWorkout.name}. Click "Add Exercise" to get started.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        <button
          type="button"
          onClick={() => {
            setAssignmentName('');
            setWeeklyWorkouts(prev => prev.map(day => ({ ...day, exercises: [] })));
            setSelectedClientId(preselectedClientId || null);
            setError('');
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={createProgramAndAssign}
          disabled={!selectedClientId || !assignmentName.trim() || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Assignment...' : 'Create & Assign'}
        </button>
      </div>

      {/* Enhanced Exercise Selection Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                {selectedExerciseForConfig ? 'Configure Exercise' : 'Select Exercise'}
              </h3>
              {!selectedExerciseForConfig && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={exerciseSearchTerm}
                    onChange={(e) => setExerciseSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1 overflow-hidden">
              {!selectedExerciseForConfig ? (
                /* Exercise Selection View */
                <div className="p-6 h-full overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      Loading exercises...
                    </div>
                  ) : filteredExercises.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {exerciseSearchTerm ? 'No exercises found matching your search.' : 
                       exercises.length === 0 ? 'No exercises available. Please add some exercises first.' : 
                       'No exercises match your search criteria.'}
                      <div className="mt-2 text-sm">
                        Total exercises loaded: {exercises.length}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredExercises.map(exercise => (
                      <div
                        key={exercise.id}
                        onClick={() => selectExerciseForConfiguration(exercise)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-gray-900 mb-2">{exercise.name}</div>
                        {exercise.muscle_groups && (
                          <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block">
                            {exercise.muscle_groups.join(', ')}
                          </div>
                        )}
                        {exercise.difficulty_level && (
                          <div className={`text-xs px-2 py-1 rounded inline-block ml-1 ${
                            exercise.difficulty_level === 'beginner' ? 'text-green-600 bg-green-100' :
                            exercise.difficulty_level === 'intermediate' ? 'text-yellow-600 bg-yellow-100' :
                            'text-red-600 bg-red-100'
                          }`}>
                            {exercise.difficulty_level}
                          </div>
                        )}
                      </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Exercise Configuration View */
                <div className="p-6 h-full overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Exercise Info */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">{selectedExerciseForConfig.name}</h4>
                      {selectedExerciseForConfig.muscle_groups && (
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-700 mb-1">Muscle Groups:</h5>
                          <div className="text-sm text-blue-600">
                            {selectedExerciseForConfig.muscle_groups.join(', ')}
                          </div>
                        </div>
                      )}
                      {selectedExerciseForConfig.equipment && (
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-700 mb-1">Equipment:</h5>
                          <div className="text-sm text-gray-600">
                            {selectedExerciseForConfig.equipment.join(', ')}
                          </div>
                        </div>
                      )}
                      {selectedExerciseForConfig.difficulty_level && (
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-700 mb-1">Difficulty:</h5>
                          <div className={`inline-block text-xs px-2 py-1 rounded ${
                            selectedExerciseForConfig.difficulty_level === 'beginner' ? 'text-green-600 bg-green-100' :
                            selectedExerciseForConfig.difficulty_level === 'intermediate' ? 'text-yellow-600 bg-yellow-100' :
                            'text-red-600 bg-red-100'
                          }`}>
                            {selectedExerciseForConfig.difficulty_level}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Configuration Form */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-4">Exercise Configuration</h5>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sets</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={exerciseConfig.sets}
                              onChange={(e) => setExerciseConfig(prev => ({ ...prev, sets: parseInt(e.target.value) || 1 }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reps</label>
                            <input
                              type="text"
                              value={exerciseConfig.reps}
                              onChange={(e) => setExerciseConfig(prev => ({ ...prev, reps: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="10 or 8-12"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                          <input
                            type="text"
                            value={exerciseConfig.weight}
                            onChange={(e) => setExerciseConfig(prev => ({ ...prev, weight: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="60kg, bodyweight, 15lbs"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rest Time (seconds)</label>
                          <input
                            type="number"
                            min="10"
                            max="600"
                            value={exerciseConfig.rest_seconds}
                            onChange={(e) => setExerciseConfig(prev => ({ ...prev, rest_seconds: parseInt(e.target.value) || 60 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                          <textarea
                            value={exerciseConfig.notes}
                            onChange={(e) => setExerciseConfig(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Form cues, modifications, etc."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                {selectedExerciseForConfig && (
                  <button
                    onClick={() => setSelectedExerciseForConfig(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Back to Selection
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowExerciseModal(false);
                    setSelectedExerciseForConfig(null);
                    setExerciseSearchTerm('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                {selectedExerciseForConfig && (
                  <button
                    onClick={addExerciseToDay}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add Exercise
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
