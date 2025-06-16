'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Search, Eye, Edit, Trash2, Filter, MoreVertical, Target, Calendar, TrendingUp } from 'lucide-react';
import { withAuth } from '@/context/AuthContext';
import { ProgramService, ProgramUtils } from '@/services/programs';
import { ProgramList } from '@/types/api';

function ProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<ProgramList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await ProgramService.getPrograms();
      setPrograms(data);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProgram = async (programId: number) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    
    try {
      await ProgramService.deleteProgram(programId);
      setPrograms(prev => prev.filter(p => p.id !== programId));
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('Failed to delete program');
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || program.program_type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || program.difficulty_level === filterDifficulty;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading programs...</p>
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Training Programs</h1>
              <p className="text-gray-600 text-lg">Create and manage your comprehensive workout programs</p>
            </div>
            <button
              onClick={() => router.push('/programs/create')}
              className="btn-primary inline-flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create Program</span>
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
                  placeholder="Search programs..."
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
                {(filterType !== 'all' || filterDifficulty !== 'all') && (
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>
            
            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="mixed">Mixed</option>
                    <option value="rehabilitation">Rehabilitation</option>
                    <option value="functional">Functional</option>
                    <option value="sports_specific">Sports Specific</option>
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

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card p-12 text-center border border-gray-100">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6">
              <Target className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No programs found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || filterType !== 'all' || filterDifficulty !== 'all' 
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'Get started by creating your first training program to help your clients achieve their goals.'
              }
            </p>
            {!searchTerm && filterType === 'all' && filterDifficulty === 'all' && (
              <button
                onClick={() => router.push('/programs/create')}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Your First Program</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onDelete={handleDeleteProgram}
                onEdit={(id) => router.push(`/programs/${id}/edit`)}
                onView={(id) => router.push(`/programs/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 bg-white rounded-xl shadow-card p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Program Analytics</h3>
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              value={programs.length}
              label="Total Programs"
              color="blue"
            />
            <StatCard
              value={programs.filter(p => p.difficulty_level === 'beginner').length}
              label="Beginner"
              color="green"
            />
            <StatCard
              value={programs.filter(p => p.difficulty_level === 'intermediate').length}
              label="Intermediate"
              color="yellow"
            />
            <StatCard
              value={programs.filter(p => p.difficulty_level === 'advanced').length}
              label="Advanced"
              color="red"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Program Card Component
function ProgramCard({ 
  program, 
  onDelete, 
  onEdit, 
  onView 
}: { 
  program: ProgramList; 
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group bg-white rounded-xl shadow-card hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {program.name}
            </h3>
            {program.is_template && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                Template
              </span>
            )}
          </div>
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
                  onClick={() => { onView(program.id); setShowMenu(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View Details
                </button>
                <button
                  onClick={() => { onEdit(program.id); setShowMenu(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-3" />
                  Edit
                </button>
                <button
                  onClick={() => { onDelete(program.id); setShowMenu(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Program Details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Type:</span>
            <span className="font-medium text-gray-900">
              {ProgramUtils.formatProgramType(program.program_type)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Difficulty:</span>
            <span className={`font-medium ${
              program.difficulty_level === 'beginner' ? 'text-green-600' :
              program.difficulty_level === 'intermediate' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {ProgramUtils.formatDifficulty(program.difficulty_level)}
            </span>
          </div>
          {program.duration_weeks && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Duration:</span>
              <span className="font-medium text-gray-900 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {program.duration_weeks} weeks
              </span>
            </div>
          )}
          {program.sessions_per_week && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Frequency:</span>
              <span className="font-medium text-gray-900">
                {program.sessions_per_week}x/week
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onView(program.id)}
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            View
          </button>
          <button
            onClick={() => onEdit(program.id)}
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
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };

  return (
    <div className="text-center">
      <div className={`text-3xl font-bold mb-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

export default withAuth(ProgramsPage);