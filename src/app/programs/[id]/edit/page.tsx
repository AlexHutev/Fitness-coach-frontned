'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical,
  Edit3,
  Clock,
  Target,
  Calendar
} from 'lucide-react';
import { withAuth } from '@/context/AuthContext';
import { ProgramService } from '@/services/programs';
import { ExerciseService } from '@/services/exercises';
import { Program, Exercise, ExerciseList, WorkoutDay, ExerciseInWorkout, UpdateProgram, ProgramType, DifficultyLevel } from '@/types/api';

function ProgramEditPage() {
  const params = useParams();
  const router = useRouter();
  const programId = parseInt(params.id as string);
  
  const [originalProgram, setOriginalProgram] = useState<Program | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState<{
    dayIndex: number;
    exerciseIndex?: number;
  } | null>(null);

  useEffect(() => {
    loadProgram();
    loadExercises();
  }, [programId]);

  useEffect(() => {
    if (originalProgram && program) {
      const changed = JSON.stringify(originalProgram) !== JSON.stringify(program);
      setHasChanges(changed);
    }
  }, [program, originalProgram]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProgramService.getProgram(programId);
      setProgram(data);
      setOriginalProgram(JSON.parse(JSON.stringify(data))); // Deep copy for comparison
    } catch (err) {
      console.error('Error loading program:', err);
      setError(err instanceof Error ? err.message : 'Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const exerciseList = await ExerciseService.getExercises();
      // Convert ExerciseList to Exercise by fetching details for each
      const exerciseDetails = await Promise.all(
        exerciseList.map(async (ex) => {
          try {
            return await ExerciseService.getExercise(ex.id);
          } catch (err) {
            console.error(`Error loading exercise ${ex.id}:`, err);
            return null;
          }
        })
      );
      const validExercises = exerciseDetails.filter((ex): ex is Exercise => ex !== null);
      setExercises(validExercises);
    } catch (err) {
      console.error('Error loading exercises:', err);
    }
  };

  const handleSave = async () => {
    if (!program || !hasChanges) return;
    
    try {
      setSaving(true);
      const updateData: UpdateProgram = {
        name: program.name,
        description: program.description,
        program_type: program.program_type,
        difficulty_level: program.difficulty_level,
        duration_weeks: program.duration_weeks,
        sessions_per_week: program.sessions_per_week,
        workout_structure: program.workout_structure,
        tags: program.tags,
        equipment_needed: program.equipment_needed,
        is_template: program.is_template,
        is_active: program.is_active
      };
      
      await ProgramService.updateProgram(programId, updateData);
      setOriginalProgram(JSON.parse(JSON.stringify(program)));
      setHasChanges(false);
      
      // Show success message and redirect
      alert('Program updated successfully!');
      router.push(`/programs/${programId}`);
    } catch (err) {
      console.error('Error saving program:', err);
      alert('Failed to save program. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    router.back();
  };

  const updateProgram = (updates: Partial<Program>) => {
    if (!program) return;
    setProgram({ ...program, ...updates });
  };

  const updateWorkoutDay = (dayIndex: number, updates: Partial<WorkoutDay>) => {
    if (!program) return;
    const newWorkoutStructure = [...program.workout_structure];
    newWorkoutStructure[dayIndex] = { ...newWorkoutStructure[dayIndex], ...updates };
    updateProgram({ workout_structure: newWorkoutStructure });
  };

  const addWorkoutDay = () => {
    if (!program) return;
    const newDay: WorkoutDay = {
      day: program.workout_structure.length + 1,
      name: `Day ${program.workout_structure.length + 1}`,
      exercises: []
    };
    updateProgram({ workout_structure: [...program.workout_structure, newDay] });
  };

  const removeWorkoutDay = (dayIndex: number) => {
    if (!program || program.workout_structure.length <= 1) return;
    if (!confirm('Are you sure you want to remove this workout day?')) return;
    
    const newWorkoutStructure = program.workout_structure.filter((_, index) => index !== dayIndex);
    // Renumber the days
    newWorkoutStructure.forEach((day, index) => {
      day.day = index + 1;
    });
    updateProgram({ workout_structure: newWorkoutStructure });
  };

  const addExerciseToDay = (dayIndex: number, exercise: Exercise) => {
    if (!program) return;
    const newExercise: ExerciseInWorkout = {
      exercise_id: exercise.id,
      sets: 3,
      reps: '10',
      weight: 'bodyweight',
      rest_seconds: 60,
      notes: ''
    };
    
    const newWorkoutStructure = [...program.workout_structure];
    newWorkoutStructure[dayIndex].exercises.push(newExercise);
    updateProgram({ workout_structure: newWorkoutStructure });
    setShowExerciseSelector(null);
  };
  const removeExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
    if (!program) return;
    if (!confirm('Are you sure you want to remove this exercise?')) return;
    
    const newWorkoutStructure = [...program.workout_structure];
    newWorkoutStructure[dayIndex].exercises.splice(exerciseIndex, 1);
    updateProgram({ workout_structure: newWorkoutStructure });
  };

  const updateExerciseInDay = (dayIndex: number, exerciseIndex: number, updates: Partial<ExerciseInWorkout>) => {
    if (!program) return;
    const newWorkoutStructure = [...program.workout_structure];
    newWorkoutStructure[dayIndex].exercises[exerciseIndex] = {
      ...newWorkoutStructure[dayIndex].exercises[exerciseIndex],
      ...updates
    };
    updateProgram({ workout_structure: newWorkoutStructure });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading program...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Target className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Program Not Found</h3>
          <p className="text-gray-600 mb-8">
            {error || 'The program you\'re trying to edit doesn\'t exist or has been deleted.'}
          </p>
          <button
            onClick={() => router.push('/programs')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Programs</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Program</h1>
              <p className="text-gray-600">Make changes to your training program</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Program Details Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Program Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name
                  </label>
                  <input
                    type="text"
                    value={program.name}
                    onChange={(e) => updateProgram({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter program name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={program.description || ''}
                    onChange={(e) => updateProgram({ description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the program"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Type
                  </label>
                  <select
                    value={program.program_type}
                    onChange={(e) => updateProgram({ program_type: e.target.value as ProgramType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="functional">Functional</option>
                    <option value="sports_specific">Sports Specific</option>
                    <option value="rehabilitation">Rehabilitation</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={program.difficulty_level}
                    onChange={(e) => updateProgram({ difficulty_level: e.target.value as DifficultyLevel })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (weeks)
                    </label>
                    <input
                      type="number"
                      value={program.duration_weeks || ''}
                      onChange={(e) => updateProgram({ duration_weeks: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12"
                      min="1"
                      max="52"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sessions/week
                    </label>
                    <input
                      type="number"
                      value={program.sessions_per_week || ''}
                      onChange={(e) => updateProgram({ sessions_per_week: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3"
                      min="1"
                      max="7"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_template"
                    checked={program.is_template}
                    onChange={(e) => updateProgram({ is_template: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_template" className="text-sm font-medium text-gray-700">
                    Save as template
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Workout Structure */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Workout Structure</h3>
                <button
                  onClick={addWorkoutDay}
                  className="btn-secondary inline-flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Day</span>
                </button>
              </div>

              {program.workout_structure.map((day, dayIndex) => (
                <WorkoutDayEditor
                  key={dayIndex}
                  day={day}
                  dayIndex={dayIndex}
                  exercises={exercises}
                  onUpdateDay={(updates) => updateWorkoutDay(dayIndex, updates)}
                  onRemoveDay={() => removeWorkoutDay(dayIndex)}
                  onAddExercise={() => setShowExerciseSelector({ dayIndex })}
                  onRemoveExercise={(exerciseIndex) => removeExerciseFromDay(dayIndex, exerciseIndex)}
                  onUpdateExercise={(exerciseIndex, updates) => updateExerciseInDay(dayIndex, exerciseIndex, updates)}
                  canRemoveDay={program.workout_structure.length > 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <ExerciseSelectorModal
          exercises={exercises}
          onSelect={(exercise) => addExerciseToDay(showExerciseSelector.dayIndex, exercise)}
          onClose={() => setShowExerciseSelector(null)}
        />
      )}
    </div>
  );
}

// Exercise Selector Modal Component
function ExerciseSelectorModal({
  exercises,
  onSelect,
  onClose
}: {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscleGroup = !selectedMuscleGroup || 
      exercise.muscle_groups?.includes(selectedMuscleGroup);
    const matchesEquipment = !selectedEquipment || 
      exercise.equipment?.includes(selectedEquipment);
    
    return matchesSearch && matchesMuscleGroup && matchesEquipment;
  });

  // Get unique muscle groups and equipment for filters
  const allMuscleGroups = Array.from(new Set(
    exercises.flatMap(ex => ex.muscle_groups || [])
  )).sort();
  
  const allEquipment = Array.from(new Set(
    exercises.flatMap(ex => ex.equipment || [])
  )).sort();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Select Exercise</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ×
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <select
              value={selectedMuscleGroup}
              onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Muscle Groups</option>
              {allMuscleGroups.map(muscle => (
                <option key={muscle} value={muscle}>{muscle}</option>
              ))}
            </select>
            
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Equipment</option>
              {allEquipment.map(equipment => (
                <option key={equipment} value={equipment}>{equipment}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Exercise List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No exercises found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 mb-2">{exercise.name}</h4>
                  {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {exercise.muscle_groups.slice(0, 3).map((muscle, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600"
                        >
                          {muscle}
                        </span>
                      ))}
                      {exercise.muscle_groups.length > 3 && (
                        <span className="text-xs text-gray-500">+{exercise.muscle_groups.length - 3}</span>
                      )}
                    </div>
                  )}
                  {exercise.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{exercise.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProgramEditPage);
