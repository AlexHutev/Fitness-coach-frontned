'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  Trash2, 
  Play, 
  Calendar, 
  Clock, 
  Target, 
  Dumbbell,
  Users,
  CheckCircle,
  MoreVertical,
  Heart,
  Zap,
  Trophy
} from 'lucide-react';
import { withAuth } from '@/context/AuthContext';
import { ProgramService, ProgramUtils } from '@/services/programs';
import { ExerciseService } from '@/services/exercises';
import { Program, Exercise, WorkoutDay, ExerciseInWorkout } from '@/types/api';

function ProgramViewPage() {
  const params = useParams();
  const router = useRouter();
  const programId = parseInt(params.id as string);
  
  const [program, setProgram] = useState<Program | null>(null);
  const [exercises, setExercises] = useState<Record<number, Exercise>>({});
  const [loading, setLoading] = useState(true);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && programId) {
      loadProgram();
    }
  }, [programId, isMounted]);

  useEffect(() => {
    if (program?.workout_structure) {
      loadExerciseDetails();
    }
  }, [program]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProgramService.getProgram(programId);
      setProgram(data);
    } catch (err) {
      console.error('Error loading program:', err);
      setError(err instanceof Error ? err.message : 'Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  const loadExerciseDetails = async () => {
    if (!program?.workout_structure) return;
    
    try {
      setExercisesLoading(true);
      const exerciseIds = new Set<number>();
      
      program.workout_structure.forEach(day => {
        day.exercises.forEach(exercise => {
          exerciseIds.add(exercise.exercise_id);
        });
      });

      const exercisePromises = Array.from(exerciseIds).map(id =>
        ExerciseService.getExercise(id).catch(() => null)
      );
      
      const exerciseResults = await Promise.all(exercisePromises);
      const exerciseMap: Record<number, Exercise> = {};
      
      exerciseResults.forEach((exercise, index) => {
        if (exercise) {
          const exerciseId = Array.from(exerciseIds)[index];
          exerciseMap[exerciseId] = exercise;
        }
      });
      
      setExercises(exerciseMap);
    } catch (err) {
      console.error('Error loading exercise details:', err);
    } finally {
      setExercisesLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await ProgramService.deleteProgram(programId);
      router.push('/programs');
    } catch (err) {
      console.error('Error deleting program:', err);
      alert('Failed to delete program');
    }
  };

  const handleDuplicate = async () => {
    if (!program) return;
    
    try {
      setDuplicating(true);
      const newName = prompt('Enter name for the duplicated program:', `${program.name} (Copy)`);
      if (!newName) return;
      
      const duplicatedProgram = await ProgramService.duplicateProgram(programId, newName);
      router.push(`/programs/${duplicatedProgram.id}`);
    } catch (err) {
      console.error('Error duplicating program:', err);
      alert('Failed to duplicate program');
    } finally {
      setDuplicating(false);
    }
  };

  if (!isMounted || loading) {
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
            {error || 'The program you\'re looking for doesn\'t exist or has been deleted.'}
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

  const currentWorkout = program.workout_structure.find(day => day.day === selectedDay);
  const totalExercises = ProgramUtils.getTotalExercises(program);
  const estimatedDuration = currentWorkout ? ProgramUtils.getEstimatedDuration(currentWorkout) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/programs/${programId}/edit`)}
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              
              <button
                onClick={handleDuplicate}
                disabled={duplicating}
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>{duplicating ? 'Duplicating...' : 'Duplicate'}</span>
              </button>
              
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger inline-flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Program Header */}
          <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 mb-6 lg:mb-0 lg:mr-8">
                <div className="flex items-center space-x-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
                  {program.is_template && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700">
                      Template
                    </span>
                  )}
                </div>
                
                {program.description && (
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {program.description}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-semibold text-gray-900">
                      {ProgramUtils.formatProgramType(program.program_type)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-500">Difficulty</p>
                    <p className={`font-semibold ${
                      program.difficulty_level === 'beginner' ? 'text-green-600' :
                      program.difficulty_level === 'intermediate' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {ProgramUtils.formatDifficulty(program.difficulty_level)}
                    </p>
                  </div>
                  
                  {program.duration_weeks && (
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">{program.duration_weeks} weeks</p>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-2">
                      <Dumbbell className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-sm text-gray-500">Exercises</p>
                    <p className="font-semibold text-gray-900">{totalExercises}</p>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-80">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push(`/programs/assignments?program=${programId}`)}
                      className="w-full bg-white text-blue-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Assign to Clients</span>
                    </button>
                    <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>Start Workout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Day Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Workout Days</h3>
              <div className="space-y-2">
                {program.workout_structure.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => setSelectedDay(day.day)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedDay === day.day
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Day {day.day}</span>
                      <span className="text-sm text-gray-500">
                        {day.exercises.length} exercises
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">{day.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Workout Details */}
          <div className="lg:col-span-3">
            {currentWorkout && (
              <div className="space-y-6">
                {/* Day Header */}
                <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Day {currentWorkout.day}: {currentWorkout.name}
                      </h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          ~{estimatedDuration} minutes
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Dumbbell className="w-4 h-4 mr-1" />
                          {currentWorkout.exercises.length} exercises
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-4">
                  {currentWorkout.exercises.map((exerciseInWorkout, index) => (
                    <ExerciseCard
                      key={index}
                      exerciseInWorkout={exerciseInWorkout}
                      exercise={exercises[exerciseInWorkout.exercise_id]}
                      exerciseNumber={index + 1}
                      loading={exercisesLoading}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Program</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{program.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ 
  exerciseInWorkout, 
  exercise, 
  exerciseNumber, 
  loading 
}: {
  exerciseInWorkout: ExerciseInWorkout;
  exercise?: Exercise;
  exerciseNumber: number;
  loading: boolean;
}) {
  if (loading || !exercise) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">{exerciseNumber}</span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">{exercise.name}</h4>
              {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {exercise.muscle_groups.map((muscle, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Exercise Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Sets</p>
              <p className="font-semibold text-gray-900">{exerciseInWorkout.sets}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reps</p>
              <p className="font-semibold text-gray-900">{exerciseInWorkout.reps}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              <p className="font-semibold text-gray-900">{exerciseInWorkout.weight}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rest</p>
              <p className="font-semibold text-gray-900">{exerciseInWorkout.rest_seconds}s</p>
            </div>
          </div>

          {/* Exercise Instructions */}
          {exercise.instructions && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{exercise.instructions}</p>
            </div>
          )}

          {/* Exercise Notes */}
          {exerciseInWorkout.notes && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> {exerciseInWorkout.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProgramViewPage);
