'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Play, 
  SkipForward,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Target,
  Dumbbell,
  Timer,
  Weight,
  RotateCcw,
  Info,
  XCircle
} from 'lucide-react';
import { WeeklyExerciseService, WeeklyExerciseUtils, type WeeklyExercise, type WeeklySchedule } from '@/services/weeklyExercises';
import ExerciseDetailModal from '@/components/exercise/ExerciseDetailModal';

interface WeeklyExercisesProps {
  clientId: number;
  isTrainerView?: boolean;
}

const WeeklyExercises: React.FC<WeeklyExercisesProps> = ({ 
  clientId, 
  isTrainerView = false 
}) => {
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<WeeklyExercise | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showNotCompletedModal, setShowNotCompletedModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [notCompletedReason, setNotCompletedReason] = useState('');
  const [notCompletedError, setNotCompletedError] = useState('');

  useEffect(() => {
    // Set current week (Monday of this week)
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    setCurrentWeek(monday.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (currentWeek) {
      loadWeeklySchedule();
    }
  }, [currentWeek, clientId]);

  const loadWeeklySchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WeeklyExerciseService.getWeeklySchedule(clientId, currentWeek);
      setSchedule(data);
    } catch (err) {
      console.error('Error loading weekly schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weekly exercises');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeek(prevWeek.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeek(nextWeek.toISOString().split('T')[0]);
  };

  const handleExerciseClick = (exercise: WeeklyExercise) => {
    setSelectedExercise(exercise);
    setShowDetailModal(true);
  };

  const handleExerciseAction = async (exercise: WeeklyExercise, action: 'start' | 'complete' | 'skip' | 'not_completed') => {
    try {
      let updatedExercise: WeeklyExercise;
      
      switch (action) {
        case 'start':
          updatedExercise = await WeeklyExerciseService.startExercise(exercise.id);
          break;
        case 'complete':
          setSelectedExercise(exercise);
          setShowFeedbackModal(true);
          return; // Don't update state yet, wait for feedback
        case 'not_completed':
          setSelectedExercise(exercise);
          setShowNotCompletedModal(true);
          setNotCompletedReason('');
          setNotCompletedError('');
          return; // Don't update state yet, wait for reason
        case 'skip':
          updatedExercise = await WeeklyExerciseService.markExerciseSkipped(exercise.id);
          break;
        default:
          return;
      }

      // Update the exercise in the schedule
      if (schedule) {
        const newSchedule = { ...schedule };
        const dayKey = `day_${exercise.day_number}`;
        if (newSchedule.days[dayKey]) {
          newSchedule.days[dayKey] = newSchedule.days[dayKey].map(ex =>
            ex.id === exercise.id ? updatedExercise : ex
          );
          
          // Recalculate completion stats
          const allExercises = Object.values(newSchedule.days).flat();
          const completed = allExercises.filter(ex => ex.status === 'completed').length;
          newSchedule.completed_exercises = completed;
          newSchedule.completion_percentage = Math.round((completed / allExercises.length) * 100);
          
          setSchedule(newSchedule);
        }
      }
    } catch (err) {
      console.error('Error updating exercise:', err);
      alert('Failed to update exercise. Please try again.');
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedExercise) return;

    try {
      const updatedExercise = await WeeklyExerciseService.markExerciseCompleted(
        selectedExercise.id,
        feedback
      );

      // Update the exercise in the schedule
      if (schedule) {
        const newSchedule = { ...schedule };
        const dayKey = `day_${selectedExercise.day_number}`;
        if (newSchedule.days[dayKey]) {
          newSchedule.days[dayKey] = newSchedule.days[dayKey].map(ex =>
            ex.id === selectedExercise.id ? updatedExercise : ex
          );
          
          // Recalculate completion stats
          const allExercises = Object.values(newSchedule.days).flat();
          const completed = allExercises.filter(ex => ex.status === 'completed').length;
          newSchedule.completed_exercises = completed;
          newSchedule.completion_percentage = Math.round((completed / allExercises.length) * 100);
          
          setSchedule(newSchedule);
        }
      }

      setShowFeedbackModal(false);
      setSelectedExercise(null);
      setFeedback('');
    } catch (err) {
      console.error('Error completing exercise:', err);
      alert('Failed to complete exercise. Please try again.');
    }
  };

  const handleNotCompletedSubmit = async () => {
    if (!selectedExercise) return;

    // Validate that reason is provided
    if (!notCompletedReason.trim()) {
      setNotCompletedError('Please explain why you could not complete this exercise');
      return;
    }

    try {
      const updatedExercise = await WeeklyExerciseService.markExerciseSkipped(
        selectedExercise.id,
        notCompletedReason
      );

      // Update the exercise in the schedule
      if (schedule) {
        const newSchedule = { ...schedule };
        const dayKey = `day_${selectedExercise.day_number}`;
        if (newSchedule.days[dayKey]) {
          newSchedule.days[dayKey] = newSchedule.days[dayKey].map(ex =>
            ex.id === selectedExercise.id ? updatedExercise : ex
          );
          
          // Recalculate completion stats
          const allExercises = Object.values(newSchedule.days).flat();
          const completed = allExercises.filter(ex => ex.status === 'completed').length;
          newSchedule.completed_exercises = completed;
          newSchedule.completion_percentage = Math.round((completed / allExercises.length) * 100);
          
          setSchedule(newSchedule);
        }
      }

      setShowNotCompletedModal(false);
      setSelectedExercise(null);
      setNotCompletedReason('');
      setNotCompletedError('');
    } catch (err) {
      console.error('Error marking exercise as not completed:', err);
      alert('Failed to update exercise. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Loading weekly exercises...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">⚠️ Error Loading Exercises</div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={loadWeeklySchedule}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-12">
        <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No exercise schedule found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousWeek}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Week of {schedule.week_start}
              </h3>
              <p className="text-sm text-gray-500">
                {schedule.week_start} to {schedule.week_end}
              </p>
            </div>
            <button
              onClick={handleNextWeek}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{schedule.completion_percentage}%</div>
            <div className="text-sm text-gray-500">
              {schedule.completed_exercises} of {schedule.total_exercises} completed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${schedule.completion_percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Daily Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(schedule.days).map(([dayKey, exercises]) => {
          const dayNumber = parseInt(dayKey.replace('day_', ''));
          const dayName = WeeklyExerciseUtils.getDayName(dayNumber);
          const dayProgress = WeeklyExerciseUtils.calculateWeekProgress(exercises);

          return (
            <div key={dayKey} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{dayName}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{dayProgress}%</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${dayProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    isTrainerView={isTrainerView}
                    onAction={handleExerciseAction}
                    onExerciseClick={handleExerciseClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Exercise Detail Modal */}
      {showDetailModal && selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedExercise(null);
          }}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Complete Exercise: {selectedExercise.exercise_name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How did it go? (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Share your thoughts, challenges, or how you felt..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedExercise(null);
                  setFeedback('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not Completed Modal */}
      {showNotCompletedModal && selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Could Not Complete: {selectedExercise.exercise_name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please let your trainer know why you couldn't complete this exercise. This helps them adjust your program accordingly.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What happened? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notCompletedReason}
                onChange={(e) => {
                  setNotCompletedReason(e.target.value);
                  if (e.target.value.trim()) setNotCompletedError('');
                }}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  notCompletedError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Equipment wasn't available, feeling pain in my shoulder, ran out of time..."
              />
              {notCompletedError && (
                <p className="mt-1 text-sm text-red-500">{notCompletedError}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowNotCompletedModal(false);
                  setSelectedExercise(null);
                  setNotCompletedReason('');
                  setNotCompletedError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNotCompletedSubmit}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Submit & Notify Trainer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Exercise Card Component
interface ExerciseCardProps {
  exercise: WeeklyExercise;
  isTrainerView: boolean;
  onAction: (exercise: WeeklyExercise, action: 'start' | 'complete' | 'skip' | 'not_completed') => void;
  onExerciseClick: (exercise: WeeklyExercise) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isTrainerView, onAction, onExerciseClick }) => {
  const statusColor = WeeklyExerciseUtils.getStatusColor(exercise.status);
  const statusIcon = WeeklyExerciseUtils.getStatusIcon(exercise.status);
  const exerciseDetails = WeeklyExerciseUtils.formatExerciseDetails(exercise);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <button
              onClick={() => onExerciseClick(exercise)}
              className="flex items-center space-x-2 hover:text-blue-600 transition-colors group"
            >
              <h5 className="font-medium text-gray-900 group-hover:text-blue-600">
                {exercise.exercise_name}
              </h5>
              <Info className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </button>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
              {statusIcon} {exercise.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{exerciseDetails}</p>
          
          {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {exercise.muscle_groups.slice(0, 3).map((group, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-50 text-blue-700"
                >
                  {group}
                </span>
              ))}
              {exercise.muscle_groups.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-600">
                  +{exercise.muscle_groups.length - 3}
                </span>
              )}
            </div>
          )}

          {exercise.exercise_notes && (
            <p className="text-xs text-gray-500 italic mb-2">{exercise.exercise_notes}</p>
          )}
        </div>
      </div>

      {/* Exercise Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        <div className="flex items-center text-gray-600">
          <Dumbbell className="w-3 h-3 mr-1" />
          {exercise.sets} sets × {exercise.reps}
        </div>
        {exercise.weight && (
          <div className="flex items-center text-gray-600">
            <Weight className="w-3 h-3 mr-1" />
            {exercise.weight}
          </div>
        )}
        {exercise.rest_seconds && (
          <div className="flex items-center text-gray-600">
            <Timer className="w-3 h-3 mr-1" />
            {exercise.rest_seconds}s rest
          </div>
        )}
        {exercise.due_date && (
          <div className="flex items-center text-gray-600">
            <Calendar className="w-3 h-3 mr-1" />
            {exercise.due_date}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isTrainerView && (
        <div className="flex space-x-2">
          {exercise.status === 'pending' && (
            <>
              <button
                onClick={() => onAction(exercise, 'start')}
                className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span>Start</span>
              </button>
              <button
                onClick={() => onAction(exercise, 'not_completed')}
                className="bg-orange-50 text-orange-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center justify-center"
                title="Can't complete this exercise"
              >
                <XCircle className="w-3 h-3" />
              </button>
            </>
          )}
          
          {exercise.status === 'in_progress' && (
            <>
              <button
                onClick={() => onAction(exercise, 'complete')}
                className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Complete</span>
              </button>
              <button
                onClick={() => onAction(exercise, 'not_completed')}
                className="bg-orange-50 text-orange-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors flex items-center justify-center"
                title="Can't complete this exercise"
              >
                <XCircle className="w-3 h-3" />
              </button>
            </>
          )}
          
          {exercise.status === 'completed' && (
            <div className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed</span>
            </div>
          )}
          
          {exercise.status === 'skipped' && (
            <div className="flex-1 bg-orange-50 text-orange-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1">
              <XCircle className="w-3 h-3" />
              <span>Not Completed</span>
            </div>
          )}
        </div>
      )}

      {/* Client Feedback Display */}
      {exercise.client_feedback && (
        <div className={`mt-3 p-2 rounded-lg ${
          exercise.status === 'skipped' ? 'bg-orange-50' : 'bg-blue-50'
        }`}>
          <div className="flex items-start space-x-2">
            <MessageSquare className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
              exercise.status === 'skipped' ? 'text-orange-600' : 'text-blue-600'
            }`} />
            <div>
              {exercise.status === 'skipped' && (
                <p className="text-xs font-medium text-orange-700 mb-1">Reason not completed:</p>
              )}
              <p className={`text-xs ${
                exercise.status === 'skipped' ? 'text-orange-800' : 'text-blue-800'
              }`}>{exercise.client_feedback}</p>
            </div>
          </div>
        </div>
      )}

      {/* Trainer Feedback (if trainer view) */}
      {isTrainerView && exercise.trainer_feedback && (
        <div className="mt-3 p-2 bg-purple-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-3 h-3 text-purple-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-purple-800">{exercise.trainer_feedback}</p>
          </div>
        </div>
      )}

      {/* Completion Percentage */}
      {exercise.completion_percentage > 0 && exercise.completion_percentage < 100 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{exercise.completion_percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all"
              style={{ width: `${exercise.completion_percentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyExercises;
