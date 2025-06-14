'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Search, Eye, Edit, Trash2, Dumbbell } from 'lucide-react';
import { withAuth } from '@/context/AuthContext';
import { ExerciseService, ExerciseUtils } from '@/services/exercises';
import { ExerciseList } from '@/types/api';

function ExercisesPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscleGroup, setFilterMuscleGroup] = useState<string>('all');
  const [filterEquipment, setFilterEquipment] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);

  useEffect(() => {
    loadExercises();
    loadFilters();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await ExerciseService.getExercises();
      setExercises(data);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [muscleGroupsData, equipmentData] = await Promise.all([
        ExerciseService.getMuscleGroups(),
        ExerciseService.getEquipmentTypes()
      ]);
      setMuscleGroups(muscleGroupsData);
      setEquipmentTypes(equipmentData);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;
    
    try {
      await ExerciseService.deleteExercise(exerciseId);
      setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Failed to delete exercise');
    }
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle_groups?.some(group => group.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMuscleGroup = filterMuscleGroup === 'all' || 
                              exercise.muscle_groups?.includes(filterMuscleGroup);
    
    const matchesEquipment = filterEquipment === 'all' || 
                            exercise.equipment?.includes(filterEquipment);
    
    const matchesDifficulty = filterDifficulty === 'all' || 
                             exercise.difficulty_level === filterDifficulty;
    
    return matchesSearch && matchesMuscleGroup && matchesEquipment && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
              <p className="text-gray-600 mt-2">Browse and manage your exercise collection</p>
            </div>
            <button
              onClick={() => router.push('/exercises/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Exercise</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filterMuscleGroup}
                onChange={(e) => setFilterMuscleGroup(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Muscle Groups</option>
                {muscleGroups.map(group => (
                  <option key={group} value={group}>
                    {group.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>

              <select
                value={filterEquipment}
                onChange={(e) => setFilterEquipment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Equipment</option>
                {equipmentTypes.map(equipment => (
                  <option key={equipment} value={equipment}>
                    {equipment.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>

              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exercise Grid */}
        {filteredExercises.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Dumbbell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterMuscleGroup !== 'all' || filterEquipment !== 'all' || filterDifficulty !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first exercise'
              }
            </p>
            {!searchTerm && filterMuscleGroup === 'all' && filterEquipment === 'all' && filterDifficulty === 'all' && (
              <button
                onClick={() => router.push('/exercises/create')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Your First Exercise</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExercises.map((exercise) => (
              <div key={exercise.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{exercise.name}</h3>
                    {exercise.difficulty_level && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ExerciseUtils.getDifficultyColor(exercise.difficulty_level)}`}>
                        {exercise.difficulty_level}
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {exercise.muscle_groups?.slice(0, 3).map((group) => (
                        <span
                          key={group}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {group.replace('_', ' ')}
                        </span>
                      ))}
                      {exercise.muscle_groups && exercise.muscle_groups.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          +{exercise.muscle_groups.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {exercise.equipment?.slice(0, 2).map((item) => (
                        <span
                          key={item}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                        >
                          {item.replace('_', ' ')}
                        </span>
                      ))}
                      {exercise.equipment && exercise.equipment.length > 2 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          +{exercise.equipment.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/exercises/${exercise.id}`)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    
                    <button
                      onClick={() => router.push(`/exercises/${exercise.id}/edit`)}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Library Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{exercises.length}</div>
              <div className="text-sm text-gray-600">Total Exercises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {exercises.filter(ex => ex.difficulty_level === 'beginner').length}
              </div>
              <div className="text-sm text-gray-600">Beginner</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {exercises.filter(ex => ex.difficulty_level === 'intermediate').length}
              </div>
              <div className="text-sm text-gray-600">Intermediate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {exercises.filter(ex => ex.difficulty_level === 'advanced').length}
              </div>
              <div className="text-sm text-gray-600">Advanced</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ExercisesPage);
