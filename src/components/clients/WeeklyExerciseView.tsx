import React, { useState, useEffect } from 'react';
import { ProgramAssignmentService } from '@/services/program-assignments';
import { ProgramAssignmentWithDetails, AssignmentStatus } from '@/types/api';
import { 
  Calendar, 
  Clock, 
  Dumbbell, 
  Play, 
  CheckCircle, 
  Target,
  RotateCcw,
  Timer,
  Weight,
  RepeatIcon,
  StickyNote,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Star,
  Award
} from 'lucide-react';

interface WeeklyExerciseViewProps {
  clientId: number;
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

interface DayCompletion {
  [dayName: string]: {
    completed: boolean;
    completedSets: { [exerciseIndex: number]: number };
    notes: string;
    completedDate?: string;
  };
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
  'Friday', 'Saturday', 'Sunday'
];

export default function WeeklyExerciseView({ clientId }: WeeklyExerciseViewProps) {
  const [assignments, setAssignments] = useState<ProgramAssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('current');
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});
  const [dayCompletion, setDayCompletion] = useState<DayCompletion>({});
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    loadWeeklyAssignments();
    loadCompletionData();
  }, [clientId]);

  const loadWeeklyAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 Loading weekly assignments for client ID: ${clientId}`);
      
      const data = await ProgramAssignmentService.getAssignments({
        client_id: clientId,
        status: 'active',
        limit: 10
      });
      
      console.log(`📊 Raw assignments data:`, data);
      
      const filteredAssignments = data.filter(assignment => {
        const hasWorkoutStructure = assignment.workout_structure && 
          Array.isArray(assignment.workout_structure) &&
          assignment.workout_structure.length > 0;
        
        console.log(`📋 Assignment "${assignment.program_name}":`, {
          id: assignment.id,
          hasWorkoutStructure,
          workoutStructure: assignment.workout_structure
        });
        
        return hasWorkoutStructure;
      });
      
      console.log(`✅ Filtered assignments with workout structure:`, filteredAssignments);
      setAssignments(filteredAssignments);
    } catch (err) {
      console.error('❌ Error loading weekly assignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadCompletionData = () => {
    // Load completion data from localStorage (in a real app, this would come from backend)
    const saved = localStorage.getItem(`client-${clientId}-completion`);
    if (saved) {
      try {
        setDayCompletion(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing completion data:', e);
      }
    }
  };

  const saveCompletionData = (data: DayCompletion) => {
    setDayCompletion(data);
    localStorage.setItem(`client-${clientId}-completion`, JSON.stringify(data));
  };

  const toggleDayCompletion = (dayName: string) => {
    const newCompletion = { ...dayCompletion };
    if (!newCompletion[dayName]) {
      newCompletion[dayName] = { 
        completed: false, 
        completedSets: {}, 
        notes: '' 
      };
    }
    
    newCompletion[dayName].completed = !newCompletion[dayName].completed;
    if (newCompletion[dayName].completed) {
      newCompletion[dayName].completedDate = new Date().toISOString();
    } else {
      delete newCompletion[dayName].completedDate;
    }
    
    saveCompletionData(newCompletion);
  };

  const updateSetCompletion = (dayName: string, exerciseIndex: number, completedSets: number) => {
    const newCompletion = { ...dayCompletion };
    if (!newCompletion[dayName]) {
      newCompletion[dayName] = { 
        completed: false, 
        completedSets: {}, 
        notes: '' 
      };
    }
    
    newCompletion[dayName].completedSets[exerciseIndex] = completedSets;
    saveCompletionData(newCompletion);
  };

  const updateDayNotes = (dayName: string, notes: string) => {
    const newCompletion = { ...dayCompletion };
    if (!newCompletion[dayName]) {
      newCompletion[dayName] = { 
        completed: false, 
        completedSets: {}, 
        notes: '' 
      };
    }
    
    newCompletion[dayName].notes = notes;
    saveCompletionData(newCompletion);
  };

  const toggleDayExpansion = (dayName: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayName]: !prev[dayName]
    }));
  };

  const getWeekProgress = (workoutStructure: WorkoutDay[]) => {
    const completedDays = workoutStructure.filter(day => 
      dayCompletion[day.name]?.completed
    ).length;
    return {
      completed: completedDays,
      total: workoutStructure.length,
      percentage: workoutStructure.length > 0 ? Math.round((completedDays / workoutStructure.length) * 100) : 0
    };
  };

  const getDayProgress = (day: WorkoutDay) => {
    const dayData = dayCompletion[day.name];
    if (!dayData || day.exercises.length === 0) return { completed: 0, total: day.exercises.length, percentage: 0 };
    
    const completedExercises = day.exercises.filter((_, index) => {
      const completedSets = dayData.completedSets[index] || 0;
      return completedSets >= day.exercises[index].sets;
    }).length;
    
    return {
      completed: completedExercises,
      total: day.exercises.length,
      percentage: Math.round((completedExercises / day.exercises.length) * 100)
    };
  };

  const formatRestTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading weekly exercises...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
        <div className="text-center py-8">
          <Target className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Exercises</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadWeeklyAssignments}
            className="btn-secondary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
        <div className="text-center py-12">
          <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Weekly Exercises</h3>
          <p className="text-gray-600 mb-4">
            This client doesn't have any weekly exercise assignments yet.
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Weekly assignments are created by trainers using the Weekly Assignment feature</p>
            <p>• Assignments must have exercises added to show up here</p>
            <p>• Only "active" assignments are displayed</p>
          </div>
          <div className="mt-6 flex justify-center space-x-3">
            <button 
              onClick={loadWeeklyAssignments}
              className="btn-secondary"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Check Again'}
            </button>
            <button 
              onClick={() => window.location.href = '/programs/assignments?weekly=true&client=' + clientId}
              className="btn-primary"
            >
              Create Assignment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Weekly Exercise Schedule</h3>
          <p className="text-gray-600 text-sm mt-1">Track your daily workouts and progress</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={loadWeeklyAssignments}
            className="btn-secondary text-sm"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
            className="btn-secondary text-sm"
          >
            {viewMode === 'overview' ? 'Detailed View' : 'Overview'}
          </button>
        </div>
      </div>

      {/* Weekly Programs */}
      {assignments.map((assignment) => {
        const workoutStructure = assignment.workout_structure as WorkoutDay[];
        const weekProgress = getWeekProgress(workoutStructure);
        
        return (
          <div key={assignment.id} className="bg-white rounded-xl shadow-card border border-gray-100">
            {/* Program Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {assignment.program_name}
                  </h4>
                  {assignment.program_description && (
                    <p className="text-gray-600 text-sm mb-3">{assignment.program_description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 ml-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{weekProgress.percentage}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-700">
                      {weekProgress.completed}/{weekProgress.total} days
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${weekProgress.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Days of Week */}
            <div className="p-6">
              {viewMode === 'overview' ? (
                /* Overview Mode - Grid Layout */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workoutStructure.map((day) => {
                    const dayProgress = getDayProgress(day);
                    const isCompleted = dayCompletion[day.name]?.completed || false;
                    
                    return (
                      <div 
                        key={day.day} 
                        className={`border rounded-lg p-4 transition-all duration-200 ${
                          isCompleted 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">{day.name}</h5>
                          <button
                            onClick={() => toggleDayCompletion(day.name)}
                            className={`p-1 rounded-full transition-colors ${
                              isCompleted 
                                ? 'text-green-600 hover:text-green-700' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            <CheckCircle className={`w-5 h-5 ${isCompleted ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Exercises</span>
                            <span className="font-medium">{day.exercises.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-blue-600">{dayProgress.percentage}%</span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${dayProgress.percentage}%` }}
                          ></div>
                        </div>
                        
                        <button
                          onClick={() => toggleDayExpansion(day.name)}
                          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center"
                        >
                          {expandedDays[day.name] ? (
                            <>Less Details <ChevronDown className="w-4 h-4 ml-1" /></>
                          ) : (
                            <>View Details <ChevronRight className="w-4 h-4 ml-1" /></>
                          )}
                        </button>
                        
                        {expandedDays[day.name] && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="space-y-3">
                              {day.exercises.map((exercise, index) => {
                                const completedSets = dayCompletion[day.name]?.completedSets[index] || 0;
                                
                                return (
                                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-100">
                                    <div className="font-medium text-gray-900 text-sm mb-2">
                                      {exercise.exercise_name}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                                      <span>Sets: {exercise.sets}</span>
                                      <span>Reps: {exercise.reps}</span>
                                      <span>Weight: {exercise.weight}</span>
                                      <span>Rest: {formatRestTime(exercise.rest_seconds)}</span>
                                    </div>
                                    
                                    {/* Set completion tracking */}
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Sets completed:</span>
                                      <div className="flex space-x-1">
                                        {Array.from({ length: exercise.sets }, (_, setIndex) => (
                                          <button
                                            key={setIndex}
                                            onClick={() => updateSetCompletion(
                                              day.name, 
                                              index, 
                                              setIndex + 1 <= completedSets ? setIndex : setIndex + 1
                                            )}
                                            className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                                              setIndex < completedSets
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                            }`}
                                          >
                                            {setIndex + 1}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {exercise.notes && (
                                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                                        <StickyNote className="w-3 h-3 inline mr-1" />
                                        {exercise.notes}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              
                              {/* Day notes */}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Your notes for {day.name}
                                </label>
                                <textarea
                                  value={dayCompletion[day.name]?.notes || ''}
                                  onChange={(e) => updateDayNotes(day.name, e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none"
                                  rows={2}
                                  placeholder="How did this workout feel? Any notes..."
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Detailed Mode - List Layout */
                <div className="space-y-4">
                  {workoutStructure.map((day) => {
                    const isCompleted = dayCompletion[day.name]?.completed || false;
                    const dayProgress = getDayProgress(day);
                    
                    return (
                      <div 
                        key={day.day} 
                        className={`border rounded-lg transition-all duration-200 ${
                          isCompleted 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-semibold text-gray-900 flex items-center">
                                <Dumbbell className="w-4 h-4 mr-2 text-blue-600" />
                                {day.name}
                                {isCompleted && (
                                  <CheckCircle className="w-4 h-4 ml-2 text-green-600 fill-current" />
                                )}
                              </h5>
                              <p className="text-sm text-gray-600 mt-1">
                                {day.exercises.length} exercises • {dayProgress.percentage}% complete
                              </p>
                            </div>
                            <button
                              onClick={() => toggleDayCompletion(day.name)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                isCompleted
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}
                            >
                              {isCompleted ? 'Completed' : 'Mark Complete'}
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="space-y-4">
                            {day.exercises.map((exercise, index) => {
                              const completedSets = dayCompletion[day.name]?.completedSets[index] || 0;
                              const exerciseCompleted = completedSets >= exercise.sets;
                              
                              return (
                                <div 
                                  key={index} 
                                  className={`p-4 rounded-lg border transition-all duration-200 ${
                                    exerciseCompleted 
                                      ? 'border-green-200 bg-green-50' 
                                      : 'border-gray-200 bg-white'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <h6 className="font-medium text-gray-900 flex items-center">
                                      {exerciseCompleted && (
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-600 fill-current" />
                                      )}
                                      {exercise.exercise_name}
                                    </h6>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    <div className="flex items-center space-x-2">
                                      <RepeatIcon className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm">
                                        <span className="font-medium">{exercise.sets}</span> sets
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Target className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm">
                                        <span className="font-medium">{exercise.reps}</span> reps
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Weight className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm">
                                        <span className="font-medium">{exercise.weight}</span>
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Timer className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm">
                                        <span className="font-medium">{formatRestTime(exercise.rest_seconds)}</span> rest
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Set tracking */}
                                  <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        Track your sets ({completedSets}/{exercise.sets} completed)
                                      </span>
                                    </div>
                                    <div className="flex space-x-2">
                                      {Array.from({ length: exercise.sets }, (_, setIndex) => (
                                        <button
                                          key={setIndex}
                                          onClick={() => updateSetCompletion(
                                            day.name, 
                                            index, 
                                            setIndex + 1 <= completedSets ? setIndex : setIndex + 1
                                          )}
                                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            setIndex < completedSets
                                              ? 'bg-green-500 text-white'
                                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                          }`}
                                        >
                                          Set {setIndex + 1}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {exercise.notes && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                      <div className="flex items-start space-x-2">
                                        <StickyNote className="w-4 h-4 text-blue-600 mt-0.5" />
                                        <div>
                                          <div className="text-sm font-medium text-blue-900">Trainer Notes</div>
                                          <div className="text-sm text-blue-800 mt-1">{exercise.notes}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Day notes */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your notes for {day.name}
                            </label>
                            <textarea
                              value={dayCompletion[day.name]?.notes || ''}
                              onChange={(e) => updateDayNotes(day.name, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              rows={3}
                              placeholder="How did this workout feel? Any notes about form, difficulty, etc..."
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}