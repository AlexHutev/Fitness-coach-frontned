'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, Edit, Trash2, Share2, Eye, Clock, Target, 
  Dumbbell, Users, Calendar, Video, Image as ImageIcon,
  ExternalLink, Info, AlertCircle, CheckCircle
} from 'lucide-react';
import { withAuth } from '@/context/AuthContext';
import { ExerciseService, ExerciseUtils } from '@/services/exercises';
import { Exercise } from '@/types/api';

function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const exerciseId = parseInt(params.id as string);
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExerciseService.getExercise(exerciseId);
      setExercise(data);
    } catch (err) {
      console.error('Error loading exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exercise');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!exercise) return;
    
    try {
      setDeleting(true);
      await ExerciseService.deleteExercise(exercise.id);
      router.push('/exercises');
    } catch (err) {
      console.error('Error deleting exercise:', err);
      alert('Failed to delete exercise');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise details...</p>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exercise Not Found</h2>
          <p className="text-gray-600 mb-8">
            {error || 'The exercise you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}
          </p>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/exercises')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Exercise Library</span>
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{exercise.name}</h1>
              <div className="flex flex-wrap items-center gap-4">
                {exercise.difficulty_level && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ExerciseUtils.getDifficultyColor(exercise.difficulty_level)}`}>
                    {exercise.difficulty_level.charAt(0).toUpperCase() + exercise.difficulty_level.slice(1)}
                  </span>
                )}
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="text-sm">{exercise.is_public ? 'Public' : 'Private'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="text-sm">Created {formatDate(exercise.created_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/exercises/${exercise.id}/edit`)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {exercise.description && (
              <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed">{exercise.description}</p>
              </div>
            )}

            {/* Instructions */}
            {exercise.instructions && (
              <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Instructions
                </h2>
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {exercise.instructions}
                  </div>
                </div>
              </div>
            )}

            {/* Media Section */}
            {(exercise.image_url || exercise.video_url) && (
              <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-purple-600" />
                  Media
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Exercise Image */}
                  {exercise.image_url && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Exercise Image
                      </h3>
                      {!imageError ? (
                        <img
                          src={exercise.image_url}
                          alt={exercise.name}
                          className="w-full h-64 object-cover rounded-lg border border-gray-200"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500 text-sm">Image not available</p>
                            <a
                              href={exercise.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm inline-flex items-center mt-2"
                            >
                              <span>View original link</span>
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Exercise Video */}
                  {exercise.video_url && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <Video className="w-4 h-4 mr-2" />
                        Exercise Video
                      </h3>
                      <div className="aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <Video className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500 text-sm mb-3">Video demonstration</p>
                          <a
                            href={exercise.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            <span>Watch Video</span>
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Exercise Details */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Exercise Details
              </h3>
              
              <div className="space-y-4">
                {/* Muscle Groups */}
                {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Target Muscles</h4>
                    <div className="flex flex-wrap gap-2">
                      {exercise.muscle_groups.map((group) => (
                        <span
                          key={group}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                        >
                          {group.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Equipment */}
                {exercise.equipment && exercise.equipment.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <Dumbbell className="w-4 h-4 mr-1" />
                      Equipment Needed
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {exercise.equipment.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200"
                        >
                          {item.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Difficulty */}
                {exercise.difficulty_level && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Difficulty Level</h4>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ExerciseUtils.getDifficultyColor(exercise.difficulty_level)}`}>
                      {exercise.difficulty_level.charAt(0).toUpperCase() + exercise.difficulty_level.slice(1)}
                    </span>
                  </div>
                )}
                
                {/* Visibility */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Visibility</h4>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {exercise.is_public ? 'Public Exercise' : 'Private Exercise'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exercise Stats */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Exercise Stats</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(exercise.created_at)}
                  </span>
                </div>
                
                {exercise.updated_at && exercise.updated_at !== exercise.created_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(exercise.updated_at)}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Exercise ID</span>
                  <span className="text-sm font-medium text-gray-900">#{exercise.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Exercise</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "<span className="font-medium">{exercise.name}</span>"? 
              This will permanently remove the exercise from your library.
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Exercise'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(ExerciseDetailPage);