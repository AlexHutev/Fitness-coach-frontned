import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  GripVertical,
  Edit3,
  Clock,
  Target,
  Calendar
} from 'lucide-react';
import { WorkoutDay, Exercise, ExerciseInWorkout } from '@/types/api';

interface WorkoutDayEditorProps {
  day: WorkoutDay;
  dayIndex: number;
  exercises: Exercise[];
  onUpdateDay: (updates: Partial<WorkoutDay>) => void;
  onRemoveDay: () => void;
  onAddExercise: () => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onUpdateExercise: (exerciseIndex: number, updates: Partial<ExerciseInWorkout>) => void;
  canRemoveDay: boolean;
}

export default function WorkoutDayEditor({
  day,
  dayIndex,
  exercises,
  onUpdateDay,
  onRemoveDay,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  canRemoveDay
}: WorkoutDayEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(day.name);

  const handleNameSave = () => {
    onUpdateDay({ name: editedName });
    setIsEditing(false);
  };

  const handleNameCancel = () => {
    setEditedName(day.name);
    setIsEditing(false);
  };

  const getExerciseDetails = (exerciseId: number) => {
    return exercises.find(ex => ex.id === exerciseId);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      {/* Day Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium text-sm">
            {dayIndex + 1}
          </div>
          
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') handleNameCancel();
                }}
                autoFocus
              />
              <button
                onClick={handleNameSave}
                className="text-green-600 hover:text-green-700"
              >
                ✓
              </button>
              <button
                onClick={handleNameCancel}
                className="text-red-600 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{day.name}</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
          </span>
          {canRemoveDay && (
            <button
              onClick={onRemoveDay}
              className="text-red-600 hover:text-red-700 p-1"
              title="Remove day"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {day.exercises.map((exercise, exerciseIndex) => {
          const exerciseDetails = getExerciseDetails(exercise.exercise_id);
          
          return (
            <div
              key={exerciseIndex}
              className="border border-gray-100 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {exerciseDetails?.name || `Exercise ID: ${exercise.exercise_id}`}
                  </h4>
                  {exerciseDetails?.muscle_groups && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {exerciseDetails.muscle_groups.map((group, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => onRemoveExercise(exerciseIndex)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Remove exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Exercise Configuration */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={exercise.sets}
                    onChange={(e) => onUpdateExercise(exerciseIndex, { 
                      sets: parseInt(e.target.value) || 1 
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Reps
                  </label>
                  <input
                    type="text"
                    value={exercise.reps}
                    onChange={(e) => onUpdateExercise(exerciseIndex, { 
                      reps: e.target.value 
                    })}
                    placeholder="10 or 8-12"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Weight
                  </label>
                  <input
                    type="text"
                    value={exercise.weight}
                    onChange={(e) => onUpdateExercise(exerciseIndex, { 
                      weight: e.target.value 
                    })}
                    placeholder="60kg or bodyweight"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Rest (sec)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={exercise.rest_seconds}
                    onChange={(e) => onUpdateExercise(exerciseIndex, { 
                      rest_seconds: parseInt(e.target.value) || 60 
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Exercise Notes */}
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={exercise.notes || ''}
                  onChange={(e) => onUpdateExercise(exerciseIndex, { 
                    notes: e.target.value 
                  })}
                  placeholder="Form cues, modifications, etc."
                  rows={2}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          );
        })}

        {/* Add Exercise Button */}
        <button
          onClick={onAddExercise}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Exercise</span>
        </button>
      </div>
    </div>
  );
}