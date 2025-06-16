'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Search, Eye, Edit, Trash2, Dumbbell, Filter, MoreVertical, TrendingUp } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Exercise Library</h1>
              <p className="text-gray-600 text-lg">Build and manage your comprehensive exercise collection</p>
            </div>
            <button
              onClick={() => router.push('/exercises/create')}
              className="btn-primary inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Exercise</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 mr-2" />
                <span>Filters</span>
                {(filterMuscleGroup !== 'all' || filterEquipment !== 'all' || filterDifficulty !== 'all') && (
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>
            
            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={filterMuscleGroup}
                    onChange={(e) => setFilterMuscleGroup(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Grid */}
        {filteredExercises.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card p-12 text-center border border-gray-100">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
              <Dumbbell className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No exercises found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || filterMuscleGroup !== 'all' || filterEquipment !== 'all' || filterDifficulty !== 'all'
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'Get started by adding your first exercise to build your comprehensive library.'
              }
            </p>
            {!searchTerm && filterMuscleGroup === 'all' && filterEquipment === 'all' && filterDifficulty === 'all' && (
              <button
                onClick={() => router.push('/exercises/create')}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Your First Exercise</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onDelete={handleDeleteExercise}
                onEdit={(id) => router.push(`/exercises/${id}/edit`)}
                onView={(id) => router.push(`/exercises/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 bg-white rounded-xl shadow-card p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Library Analytics</h3>
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              value={exercises.length}
              label="Total Exercises"
              color="blue"
            />
            <StatCard
              value={exercises.filter(ex => ex.difficulty_level === 'beginner').length}
              label="Beginner"
              color="green"
            />
            <StatCard
              value={exercises.filter(ex => ex.difficulty_level === 'intermediate').length}
              label="Intermediate"
              color="yellow"
            />
            <StatCard
              value={exercises.filter(ex => ex.difficulty_level === 'advanced').length}
              label="Advanced"
              color="red"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ 
  exercise, 
  onDelete, 
  onEdit, 
  onView 
}: { 
  exercise: ExerciseList; 
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group bg-white rounded-xl shadow-card hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {exercise.name}
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => { onView(exercise.id); setShowMenu(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View Details
                </button>
                <button
                  onClick={() => { onEdit(exercise.id); setShowMenu(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-3" />
                  Edit
                </button>
                <button
                  onClick={() => { onDelete(exercise.id); setShowMenu(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Difficulty Badge */}
        {exercise.difficulty_level && (
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ExerciseUtils.getDifficultyColor(exercise.difficulty_level)}`}>
              {exercise.difficulty_level.charAt(0).toUpperCase() + exercise.difficulty_level.slice(1)}
            </span>
          </div>
        )}

        {/* Muscle Groups */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {exercise.muscle_groups?.slice(0, 3).map((group) => (
              <span
                key={group}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
              >
                {group.replace('_', ' ')}
              </span>
            ))}
            {exercise.muscle_groups && exercise.muscle_groups.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                +{exercise.muscle_groups.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Equipment */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {exercise.equipment?.slice(0, 2).map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700"
              >
                {item.replace('_', ' ')}
              </span>
            ))}
            {exercise.equipment && exercise.equipment.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                +{exercise.equipment.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onView(exercise.id)}
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onEdit(exercise.id)}
            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="text-center">
      <div className={`text-3xl font-bold mb-2 ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

export default withAuth(ExercisesPage);