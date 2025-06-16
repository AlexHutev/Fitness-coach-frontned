'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { withAuth } from '@/context/AuthContext';
import { ProgramService } from '@/services/programs';
import { CreateProgram, WorkoutDay, ProgramType, DifficultyLevel } from '@/types/api';

function CreateProgramPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Programs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Program</h1>
          <p className="text-gray-600 mt-2">Design a custom training program</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                  placeholder="Brief description of the program..."
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

          {/* Workout Structure */}
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
              <div className="text-center py-8 text-gray-500">
                <p>No workout days added yet. Click &quot;Add Day&quot; to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {program.workout_structure.map((day, dayIndex) => (
                  <div key={dayIndex} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <input
                        type="text"
                        value={day.name}
                        onChange={(e) => updateWorkoutDay(dayIndex, { name: e.target.value })}
                        className="text-lg font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                        placeholder="Workout day name"
                      />
                      <button
                        type="button"
                        onClick={() => removeWorkoutDay(dayIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Day {day.day} • {day.exercises.length} exercises
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
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
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(CreateProgramPage);
