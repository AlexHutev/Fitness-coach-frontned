'use client';

import React from 'react';
import { X, Play, ExternalLink, Info, Target, Clock, Weight } from 'lucide-react';
import { WeeklyExercise } from '@/services/weeklyExercises';

interface ExerciseDetailModalProps {
  exercise: WeeklyExercise;
  isOpen: boolean;
  onClose: () => void;
}

const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handleVideoClick = () => {
    if (exercise.exercise_video_url) {
      window.open(exercise.exercise_video_url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {exercise.exercise_name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Sets</p>
              <p className="font-semibold text-blue-900">{exercise.sets}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Reps</p>
              <p className="font-semibold text-green-900">{exercise.reps}</p>
            </div>
            {exercise.weight && (
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Weight className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="font-semibold text-orange-900">{exercise.weight}</p>
              </div>
            )}
            {exercise.rest_seconds && (
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Rest</p>
                <p className="font-semibold text-purple-900">{exercise.rest_seconds}s</p>
              </div>
            )}
          </div>

          {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2 text-gray-600" />
                Target Muscles
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.muscle_groups.map((group, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>
          )}

          {exercise.exercise_description && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2 text-gray-600" />
                Description
              </h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                {exercise.exercise_description}
              </p>
            </div>
          )}

          {exercise.exercise_instructions && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2 text-gray-600" />
                Instructions
              </h3>
              <div className="text-gray-700 bg-gray-50 rounded-lg p-3">
                {exercise.exercise_instructions.split('\n').map((line, index) => (
                  <p key={index} className="mb-1">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {exercise.exercise_notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2 text-gray-600" />
                Notes
              </h3>
              <p className="text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                {exercise.exercise_notes}
              </p>
            </div>
          )}

          {exercise.exercise_video_url && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <Play className="w-4 h-4 mr-2 text-gray-600" />
                Exercise Video
              </h3>
              <button
                onClick={handleVideoClick}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Watch Exercise Video</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Opens in a new tab: {exercise.exercise_video_url}
              </p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium capitalize text-gray-900">
                  {exercise.status.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Progress</p>
                <p className="font-medium text-gray-900">
                  {exercise.completion_percentage}%
                </p>
              </div>
              {exercise.due_date && (
                <div>
                  <p className="text-gray-600">Due Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(exercise.due_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Day</p>
                <p className="font-medium text-gray-900">Day {exercise.day_number}</p>
              </div>
            </div>
          </div>

          {exercise.client_feedback && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Your Feedback</h3>
              <p className="text-gray-700 bg-blue-50 rounded-lg p-3 italic">
                "{exercise.client_feedback}"
              </p>
            </div>
          )}

          {exercise.trainer_feedback && (
            <div className={exercise.client_feedback ? '' : 'border-t border-gray-200 pt-4'}>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Trainer Feedback</h3>
              <p className="text-gray-700 bg-purple-50 rounded-lg p-3 italic">
                "{exercise.trainer_feedback}"
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailModal;