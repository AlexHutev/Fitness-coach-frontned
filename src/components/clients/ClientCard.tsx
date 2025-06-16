'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Eye, 
  Edit, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar,
  Target,
  Activity,
  User,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import type { ClientSummary } from '@/types/api';

export interface ClientCardProps {
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

  const formatGoal = (goal: string | undefined) => {
    if (!goal) return 'Not specified';
    return goal.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getGoalIcon = (goal: string | undefined) => {
    switch (goal) {
      case 'weight_loss':
        return '📉';
      case 'weight_gain':
        return '📈';
      case 'muscle_gain':
        return '💪';
      case 'endurance':
        return '🏃';
      case 'strength':
        return '🏋️';
      case 'general_fitness':
        return '🎯';
      case 'rehabilitation':
        return '🏥';
      default:
        return '🎯';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? CheckCircle : AlertTriangle;
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {client.first_name.charAt(0)}{client.last_name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {client.first_name} {client.last_name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.is_active)}`}>
                {client.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1">
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
                <button
                  onClick={() => {
                    setShowMenu(false);
                    // Add assign program functionality
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Assign Program
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      {client.email && (
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Mail className="w-4 h-4 mr-2 text-gray-400" />
          <span className="truncate">{client.email}</span>
        </div>
      )}

      {/* Primary Goal */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">{getGoalIcon(client.primary_goal)}</span>
          <span>{formatGoal(client.primary_goal)}</span>
        </div>
      </div>

      {/* Client Since */}
      <div className="flex items-center text-xs text-gray-500 mb-4">
        <Calendar className="w-4 h-4 mr-2" />
        <span>Client since {formatDate(client.created_at)}</span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900">Programs</div>
          <div className="text-xs text-gray-600">0 Active</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900">Sessions</div>
          <div className="text-xs text-gray-600">0 This Week</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Link
          href={`/clients/${client.id}`}
          className="flex-1 btn-secondary text-sm py-2 text-center"
        >
          View Profile
        </Link>
        <Link
          href={`/clients/${client.id}/edit`}
          className="flex-1 btn-primary text-sm py-2 text-center"
        >
          Edit
        </Link>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}