'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Search,
  Filter,
  Dumbbell,
  Clock,
  RotateCcw,
  Weight,
  ChevronDown,
  ChevronUp,
  Edit3
} from 'lucide-react';
import { withAuth } from '@/context/AuthContext';
import { ProgramService } from '@/services/programs';
import { ExerciseService, ExerciseUtils } from '@/services/exercises';
import { 
  CreateProgram, 
  WorkoutDay, 
  ProgramType, 
  DifficultyLevel, 
  ExerciseInWorkout,
  ExerciseList 
} from '@/types/api';

function CreateProgramPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [program, setProgram] = useState<CreateProgram>({
    name: '',
    description: '',
    program_type: 'strength',
    difficulty_level: 'beginner',
    duration_weeks: 4,
    sessions_per_week: 3,
    workout_structure: [],
    tags: '',
    equipment_needed: [],
    is_template: true
  });

  // Exercise selection states
  const [exercises, setExercises] = useState<ExerciseList[]>([]);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);

  useEffect(() => {
    loadExercises();
    loadFilters();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await ExerciseService.getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const loadFilters = async () => {
    try {
      const [muscleGroupsData, equipmentData] = await Promise.all([
        ExerciseService.getMuscleGroups(),
        ExerciseService.getEquipmentTypes()
      ]);
      setMuscleGroups(muscleGroupsData);
      setEquipmentTypes(equipmentData);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program.name.trim()) return;

    try {
      setLoading(true);
      await ProgramService.createProgram(program);
      router.push('/programs');
    } catch (error) {
      console.error('Error creating program:', error);
      alert('Failed to create program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addWorkoutDay = () => {
    const newDay: WorkoutDay = {
      day: program.workout_structure.length + 1,
      name: `Day ${program.workout_structure.length + 1}`,
      exercises: []
    };
    setProgram(prev => ({
      ...prev,
      workout_structure: [...prev.workout_structure, newDay]
    }));
  };

  const removeWorkoutDay = (dayIndex: number) => {
    setProgram(prev => ({
      ...prev,
      workout_structure: prev.workout_structure.filter((_, index) => index !== dayIndex)
        .map((day, index) => ({ ...day, day: index + 1 }))
    }));
  };

  const updateWorkoutDay = (dayIndex: number, updates: Partial<WorkoutDay>) => {
    setProgram(prev => ({
      ...prev,
      workout_structure: prev.workout_structure.map((day, index) => 
        index === dayIndex ? { ...day, ...updates } : day
      )
    }));
  };

  const openExerciseModal = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setShowExerciseModal(true);
  };

  const addExerciseToDay = (exercise: ExerciseList) => {
    const newExercise: ExerciseInWorkout = {
      exercise_id: exercise.id,
      sets: 3,
      reps: '10',
      weight: 'bodyweight',
      rest_seconds: 60,
      notes: ''
    };

    setProgram(prev => ({
      ...prev,
      workout_structure: prev.workout_structure.map((day, index) => 
        index === selectedDay 
          ? { ...day, exercises: [...day.exercises, newExercise] }
          : day
      )
    }));
    setShowExerciseModal(false);
  };

  const removeExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
    setProgram(prev => ({
      ...prev,
      workout_structure: prev.workout_structure.map((day, index) => 
        index === dayIndex 
          ? { ...day, exercises: day.exercises.filter((_, idx) => idx !== exerciseIndex) }
          : day
      )
    }));
  };

  const updateExerciseInDay = (dayIndex: number, exerciseIndex: number, updates: Partial<ExerciseInWorkout>) => {
    setProgram(prev => ({
      ...prev,
      workout_structure: prev.workout_structure.map((day, index) => 
        index === dayIndex 
          ? { 
              ...day, 
              exercises: day.exercises.map((exercise, idx) => 
                idx === exerciseIndex ? { ...exercise, ...updates } : exercise
              )
            }
          : day
      )
    }));
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase());
    const matchesMuscleGroup = muscleGroupFilter === 'all' || 
                              exercise.muscle_groups?.includes(muscleGroupFilter);
    const matchesEquipment = equipmentFilter === 'all' || 
                            exercise.equipment?.includes(equipmentFilter);
    return matchesSearch && matchesMuscleGroup && matchesEquipment;
  });

  const stepTitles = [
    'Program Details',
    'Workout Structure',
    'Review & Create'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Programs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Program</h1>
          <p className="text-gray-600 mt-2">Design a custom training program with detailed workout structure</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep === index + 1 
                    ? 'bg-blue-600 text-white' 
                    : currentStep > index + 1 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep === index + 1 ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {title}
                </span>
                {index < stepTitles.length - 1 && (
                  <div className={`w-16 h-1 mx-4 rounded ${
                    currentStep > index + 1 ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Program Details */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Program Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    value={program.name}
                    onChange={(e) => setProgram(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Beginner Strength Training"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={program.description}
                    onChange={(e) => setProgram(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the program goals and methodology..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Type
                  </label>
                  <select
                    value={program.program_type}
                    onChange={(e) => setProgram(prev => ({ ...prev, program_type: e.target.value as ProgramType }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="mixed">Mixed</option>
                    <option value="rehabilitation">Rehabilitation</option>
                    <option value="functional">Functional</option>
                    <option value="sports_specific">Sports Specific</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={program.difficulty_level}
                    onChange={(e) => setProgram(prev => ({ ...prev, difficulty_level: e.target.value as DifficultyLevel }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (weeks)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={program.duration_weeks}
                    onChange={(e) => setProgram(prev => ({ ...prev, duration_weeks: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sessions per week
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={program.sessions_per_week}
                    onChange={(e) => setProgram(prev => ({ ...prev, sessions_per_week: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={program.tags}
                    onChange={(e) => setProgram(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="beginner, weight-loss, home-workout"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={program.is_template}
                      onChange={(e) => setProgram(prev => ({ ...prev, is_template: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Save as template</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Templates can be reused for multiple clients</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Workout Structure */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Workout Structure</h3>
                <button
                  type="button"
                  onClick={addWorkoutDay}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Day</span>
                </button>
              </div>

              {program.workout_structure.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">No workout days added yet</h4>
                  <p className="mb-6">Click "Add Day" to start building your program structure</p>
                  <button
                    type="button"
                    onClick={addWorkoutDay}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Your First Day</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {program.workout_structure.map((day, dayIndex) => (
                    <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <h4 className="text-lg font-medium text-gray-900">Day {day.day}</h4>
                          <input
                            type="text"
                            value={day.name}
                            onChange={(e) => updateWorkoutDay(dayIndex, { name: e.target.value })}
                            placeholder="Workout name (e.g., Upper Body)"
                            className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeWorkoutDay(dayIndex)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {day.exercises.map((exercise, exerciseIndex) => (
                          <div key={exerciseIndex} className="bg-gray-50 p-3 rounded-md flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">Exercise {exercise.exercise_id}</p>
                              <p className="text-sm text-gray-600">
                                {exercise.sets} sets × {exercise.reps} reps - {exercise.weight} - {exercise.rest_seconds}s rest
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExerciseFromDay(dayIndex, exerciseIndex)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => openExerciseModal(dayIndex)}
                          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center space-x-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Exercise</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Review & Create</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Program Name:</h4>
                  <p className="text-gray-600">{program.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Description:</h4>
                  <p className="text-gray-600">{program.description || 'No description provided'}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Type:</h4>
                    <p className="text-gray-600 capitalize">{program.program_type}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Level:</h4>
                    <p className="text-gray-600 capitalize">{program.difficulty_level}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Duration:</h4>
                    <p className="text-gray-600">{program.duration_weeks} weeks</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Sessions:</h4>
                    <p className="text-gray-600">{program.sessions_per_week}/week</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Workout Days:</h4>
                  <p className="text-gray-600">{program.workout_structure.length} days configured</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Creating...' : 'Create Program'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Exercise Selection Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Exercise</h3>
                <button
                  onClick={() => setShowExerciseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={exerciseSearchTerm}
                    onChange={(e) => setExerciseSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <select
                    value={muscleGroupFilter}
                    onChange={(e) => setMuscleGroupFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Muscle Groups</option>
                    {muscleGroups.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={equipmentFilter}
                    onChange={(e) => setEquipmentFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Equipment</option>
                    {equipmentTypes.map((equipment) => (
                      <option key={equipment} value={equipment}>{equipment}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Exercise List */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer"
                    onClick={() => addExerciseToDay(exercise)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {exercise.muscle_groups?.map((group, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {group}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span className="mr-4">Equipment: {exercise.equipment?.join(', ') || 'None'}</span>
                          <span>Difficulty: {exercise.difficulty_level}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(CreateProgramPage);
