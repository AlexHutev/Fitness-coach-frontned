'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Save, X, Plus, Trash2, Eye, AlertCircle, 
  Target, Dumbbell, FileText, Image as ImageIcon, Video, Users
} from 'lucide-react';
import { withAuth } from '@/context/AuthContext';
import { ExerciseService } from '@/services/exercises';
import { Exercise, UpdateExercise, DifficultyLevel } from '@/types/api';

// Available options for dropdowns
const MUSCLE_GROUPS = [
  'chest', 'shoulders', 'triceps', 'biceps', 'back', 'lats',
  'traps', 'quads', 'hamstrings', 'glutes', 'calves', 'abs',
  'core', 'forearms', 'neck', 'cardio'
];

const EQUIPMENT_OPTIONS = [
  'bodyweight', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands',
  'pull_up_bar', 'bench', 'cable_machine', 'smith_machine', 'squat_rack',
  'leg_press', 'lat_pulldown', 'rowing_machine', 'treadmill', 'elliptical',
  'stationary_bike', 'medicine_ball', 'foam_roller', 'suspension_trainer',
  'battle_ropes', 'plyometric_box', 'olympic_rings', 'parallette_bars'
];

const DIFFICULTY_OPTIONS: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];

interface FormData {
  name: string;
  description: string;
  instructions: string;
  muscle_groups: string[];
  equipment: string[];
  difficulty_level: DifficultyLevel | '';
  image_url: string;
  video_url: string;
  is_public: boolean;
}

interface FormErrors {
  [key: string]: string;
}

function EditExercisePage() {
  const router = useRouter();
  const params = useParams();
  const exerciseId = parseInt(params.id as string);
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    instructions: '',
    muscle_groups: [],
    equipment: [],
    difficulty_level: '',
    image_url: '',
    video_url: '',
    is_public: true
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExerciseService.getExercise(exerciseId);
      setExercise(data);
      
      // Populate form with existing data
      setFormData({
        name: data.name || '',
        description: data.description || '',
        instructions: data.instructions || '',
        muscle_groups: data.muscle_groups || [],
        equipment: data.equipment || [],
        difficulty_level: data.difficulty_level || '',
        image_url: data.image_url || '',
        video_url: data.video_url || '',
        is_public: data.is_public
      });
    } catch (err) {
      console.error('Error loading exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exercise');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      errors.name = 'Exercise name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Exercise name must be at least 2 characters';
    } else if (formData.name.length > 200) {
      errors.name = 'Exercise name must be less than 200 characters';
    }

    // URL validation
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      errors.image_url = 'Please enter a valid image URL';
    }

    if (formData.video_url && !isValidUrl(formData.video_url)) {
      errors.video_url = 'Please enter a valid video URL';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (field: 'muscle_groups' | 'equipment', value: string) => {
    setFormData(prev => {
      const currentArray = prev[field];
      const isSelected = currentArray.includes(value);
      
      return {
        ...prev,
        [field]: isSelected 
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const updateData: UpdateExercise = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        instructions: formData.instructions.trim() || undefined,
        muscle_groups: formData.muscle_groups.length > 0 ? formData.muscle_groups : undefined,
        equipment: formData.equipment.length > 0 ? formData.equipment : undefined,
        difficulty_level: formData.difficulty_level || undefined,
        image_url: formData.image_url.trim() || undefined,
        video_url: formData.video_url.trim() || undefined,
        is_public: formData.is_public
      };

      await ExerciseService.updateExercise(exerciseId, updateData);
      router.push(`/exercises/${exerciseId}`);
    } catch (err) {
      console.error('Error updating exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to update exercise');
    } finally {
      setSubmitting(false);
    }
  };

  const formatLabel = (value: string): string => {
    return value.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error && !exercise) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exercise Not Found</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push('/exercises')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Exercises</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/exercises/${exerciseId}`)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Exercise Details</span>
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Exercise</h1>
              <p className="text-gray-600">Update your exercise information and details</p>
            </div>
            
            <div className="flex items-center space-x-3 mt-6 lg:mt-0">
              <button
                onClick={() => router.push(`/exercises/${exerciseId}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exercise Name */}
              <div className="lg:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter exercise name (e.g., Push-ups, Bench Press)"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              {/* Difficulty Level */}
              <div>
                <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficulty_level"
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select difficulty</option>
                  {DIFFICULTY_OPTIONS.map(level => (
                    <option key={level} value={level}>
                      {formatLabel(level)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Visibility
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_public"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_public" className="ml-3 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">Make this exercise public</span>
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Public exercises can be used by other trainers
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Brief description of the exercise..."
              />
            </div>

            {/* Instructions */}
            <div className="mt-6">
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Step-by-step instructions for performing the exercise..."
              />
            </div>
          </div>

          {/* Target Muscles & Equipment */}
          <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              Target Muscles & Equipment
            </h2>
            
            {/* Muscle Groups */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Muscle Groups
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {MUSCLE_GROUPS.map(muscle => (
                  <label
                    key={muscle}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.muscle_groups.includes(muscle)
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.muscle_groups.includes(muscle)}
                      onChange={() => handleArrayChange('muscle_groups', muscle)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{formatLabel(muscle)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Dumbbell className="w-4 h-4 mr-2" />
                Equipment Needed
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {EQUIPMENT_OPTIONS.map(equipment => (
                  <label
                    key={equipment}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.equipment.includes(equipment)
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.equipment.includes(equipment)}
                      onChange={() => handleArrayChange('equipment', equipment)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{formatLabel(equipment)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Media URLs */}
          <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
              Media & Resources
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image URL */}
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image URL
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors.image_url ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {formErrors.image_url && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.image_url}</p>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Video className="w-4 h-4 mr-2" />
                  Video URL
                </label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors.video_url ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://youtube.com/watch?v=..."
                />
                {formErrors.video_url && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.video_url}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.push(`/exercises/${exerciseId}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Updating...' : 'Update Exercise'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(EditExercisePage);