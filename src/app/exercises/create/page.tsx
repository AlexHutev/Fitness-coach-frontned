'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, Image, Video, Target } from 'lucide-react';
import { withAuth } from '@/context/AuthContext';
import { ExerciseService } from '@/services/exercises';
import { CreateExercise, DifficultyLevel } from '@/types/api';

function CreateExercisePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newMuscleGroup, setNewMuscleGroup] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  
  const [exercise, setExercise] = useState<CreateExercise>({
    name: '',
    description: '',
    instructions: '',
    muscle_groups: [],
    equipment: [],
    difficulty_level: 'beginner',
    image_url: '',
    video_url: '',
    is_public: true
  });

  const muscleGroupOptions = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'abs', 'obliques', 'lower_back', 'glutes', 'quadriceps', 
    'hamstrings', 'calves', 'cardio', 'full_body'
  ];

  const equipmentOptions = [
    'bodyweight', 'dumbbells', 'barbells', 'kettlebells', 'resistance_bands',
    'pull_up_bar', 'bench', 'squat_rack', 'cable_machine', 'treadmill',
    'stationary_bike', 'elliptical', 'rowing_machine', 'foam_roller', 'medicine_ball'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise.name.trim()) return;

    try {
      setLoading(true);
      await ExerciseService.createExercise(exercise);
      router.push('/exercises');
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert('Failed to create exercise. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addMuscleGroup = () => {
    if (newMuscleGroup && !exercise.muscle_groups?.includes(newMuscleGroup)) {
      setExercise(prev => ({
        ...prev,
        muscle_groups: [...(prev.muscle_groups || []), newMuscleGroup]
      }));
      setNewMuscleGroup('');
    }
  };

  const removeMuscleGroup = (groupToRemove: string) => {
    setExercise(prev => ({
      ...prev,
      muscle_groups: prev.muscle_groups?.filter(group => group !== groupToRemove) || []
    }));
  };

  const addEquipment = () => {
    if (newEquipment && !exercise.equipment?.includes(newEquipment)) {
      setExercise(prev => ({
        ...prev,
        equipment: [...(prev.equipment || []), newEquipment]
      }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (equipmentToRemove: string) => {
    setExercise(prev => ({
      ...prev,
      equipment: prev.equipment?.filter(item => item !== equipmentToRemove) || []
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Exercises
          </button>
          <div className="flex items-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Create New Exercise</h1>
              <p className="text-gray-600 text-lg mt-1">Add a new exercise to your library</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  value={exercise.name}
                  onChange={(e) => setExercise(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., Push-ups, Bench Press, Deadlift"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={exercise.description}
                  onChange={(e) => setExercise(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Brief description of the exercise and its benefits..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  value={exercise.instructions}
                  onChange={(e) => setExercise(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Step-by-step instructions for performing the exercise..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={exercise.difficulty_level}
                  onChange={(e) => setExercise(prev => ({ ...prev, difficulty_level: e.target.value as DifficultyLevel }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="flex items-center">
                <div className="mt-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={exercise.is_public}
                      onChange={(e) => setExercise(prev => ({ ...prev, is_public: e.target.checked }))}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Make exercise public</span>
                      <p className="text-xs text-gray-500">Public exercises can be discovered and used by other trainers</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Muscle Groups */}
          <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              Target Muscle Groups
            </h3>
            
            <div className="flex space-x-3 mb-6">
              <select
                value={newMuscleGroup}
                onChange={(e) => setNewMuscleGroup(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select muscle group</option>
                {muscleGroupOptions.map(group => (
                  <option key={group} value={group}>
                    {group.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addMuscleGroup}
                disabled={!newMuscleGroup}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {exercise.muscle_groups?.map((group) => (
                <span
                  key={group}
                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                >
                  {group.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  <button
                    type="button"
                    onClick={() => removeMuscleGroup(group)}
                    className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {(!exercise.muscle_groups || exercise.muscle_groups.length === 0) && (
                <p className="text-gray-500 italic">No muscle groups selected</p>
              )}
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              Required Equipment
            </h3>
            
            <div className="flex space-x-3 mb-6">
              <select
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select equipment</option>
                {equipmentOptions.map(equipment => (
                  <option key={equipment} value={equipment}>
                    {equipment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addEquipment}
                disabled={!newEquipment}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {exercise.equipment?.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-800 rounded-full text-sm font-medium border border-gray-200"
                >
                  {item.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  <button
                    type="button"
                    onClick={() => removeEquipment(item)}
                    className="ml-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {(!exercise.equipment || exercise.equipment.length === 0) && (
                <p className="text-gray-500 italic">No equipment selected</p>
              )}
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-orange-600 font-bold text-sm">4</span>
              </div>
              Media (Optional)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Image className="w-4 h-4 mr-2" />
                  Image URL
                </label>
                <input
                  type="url"
                  value={exercise.image_url}
                  onChange={(e) => setExercise(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://example.com/exercise-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Video className="w-4 h-4 mr-2" />
                  Video URL
                </label>
                <input
                  type="url"
                  value={exercise.video_url}
                  onChange={(e) => setExercise(prev => ({ ...prev, video_url: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !exercise.name.trim()}
              className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{loading ? 'Creating...' : 'Create Exercise'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(CreateExercisePage);