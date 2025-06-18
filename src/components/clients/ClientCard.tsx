'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ClientSummary } from '@/types/api';
import { 
  Eye, 
  Edit, 
  MoreHorizontal, 
  User, 
  Calendar, 
  Target,
  Activity
} from 'lucide-react';

interface ClientCardProps {
  client: ClientSummary;
  onUpdate: () => void;
}

export function ClientCard({ client, onUpdate }: ClientCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGoalIcon = (goal?: string) => {
    switch (goal) {
      case 'weight_loss':
        return '⚖️';
      case 'muscle_gain':
        return '💪';
      case 'strength':
        return '🏋️';
      case 'endurance':
        return '🏃';
      case 'general_fitness':
        return '🎯';
      default:
        return '📈';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {client.first_name[0]}{client.last_name[0]}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {client.first_name} {client.last_name}
            </h3>
            {client.email && (
              <p className="text-sm text-gray-600">{client.email}</p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <Link
                href={`/clients/${client.id}`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                <Eye className="w-4 h-4 mr-3" />
                View Details
              </Link>
              <Link
                href={`/clients/${client.id}/edit`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                <Edit className="w-4 h-4 mr-3" />
                Edit Client
              </Link>
              <Link
                href={`/programs/assignments?client=${client.id}&type=weekly`}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowMenu(false)}
              >
                <Calendar className="w-4 h-4 mr-3" />
                Weekly Assignment
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Primary Goal */}
        {client.primary_goal && (
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Goal:</span>
            <span className="text-sm font-medium text-gray-900 flex items-center">
              <span className="mr-1">{getGoalIcon(client.primary_goal)}</span>
              {client.primary_goal.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        )}

        {/* Join Date */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Joined:</span>
          <span className="text-sm text-gray-900">{formatDate(client.created_at)}</span>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Status:</span>
          <span className={`text-sm font-medium ${
            client.is_active ? 'text-green-600' : 'text-red-600'
          }`}>
            {client.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Link
            href={`/clients/${client.id}`}
            className="btn-secondary text-center text-sm py-2"
          >
            View Profile
          </Link>
          <Link
            href={`/clients/${client.id}/programs`}
            className="btn-primary text-center text-sm py-2"
          >
            Programs
          </Link>
        </div>
        <Link
          href={`/programs/assignments?client=${client.id}&type=weekly`}
          className="w-full text-center text-sm py-2 px-4 border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center justify-center"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Create Weekly Assignment
        </Link>
      </div>
    </div>
  );
}
