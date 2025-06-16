'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';

export interface ClientFiltersProps {
  filters: {
    activeOnly: boolean;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  onFiltersChange: (filters: ClientFiltersProps['filters']) => void;
}

export function ClientFilters({ filters, onFiltersChange }: ClientFiltersProps) {
  const goals = [
    'weight_loss',
    'weight_gain', 
    'muscle_gain',
    'endurance',
    'strength',
    'general_fitness',
    'rehabilitation'
  ];

  const activityLevels = [
    'sedentary',
    'lightly_active',
    'moderately_active', 
    'very_active',
    'extremely_active'
  ];

  const formatLabel = (value: string) => {
    return value.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const resetFilters = () => {
    onFiltersChange({
      activeOnly: true,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filter Clients</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
        >
          <X className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Status</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                checked={filters.activeOnly === true}
                onChange={() => onFiltersChange({ ...filters, activeOnly: true })}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Active Only</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="status"
                checked={filters.activeOnly === false}
                onChange={() => onFiltersChange({ ...filters, activeOnly: false })}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">All Clients</span>
            </label>
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Sort By</h4>
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created_at">Date Added</option>
            <option value="first_name">First Name</option>
            <option value="last_name">Last Name</option>
            <option value="primary_goal">Primary Goal</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Order</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="sortOrder"
                checked={filters.sortOrder === 'asc'}
                onChange={() => onFiltersChange({ ...filters, sortOrder: 'asc' })}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Ascending</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sortOrder"
                checked={filters.sortOrder === 'desc'}
                onChange={() => onFiltersChange({ ...filters, sortOrder: 'desc' })}
                className="form-radio text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Descending</span>
            </label>
          </div>
        </div>

        {/* Applied Filters Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Applied Filters</h4>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              Status: {filters.activeOnly ? 'Active Only' : 'All Clients'}
            </div>
            <div className="text-xs text-gray-600">
              Sort: {formatLabel(filters.sortBy)} ({filters.sortOrder === 'asc' ? '↑' : '↓'})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}