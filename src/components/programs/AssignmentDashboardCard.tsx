'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProgramAssignmentService } from '@/services/program-assignments';
import { ProgramAssignmentWithDetails } from '@/types/api';
import { Users, TrendingUp, Calendar, CheckCircle } from 'lucide-react';

export default function AssignmentDashboardCard() {
  const [assignments, setAssignments] = useState<ProgramAssignmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await ProgramAssignmentService.getAssignments({ limit: 50 });
      setAssignments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.status === 'active').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    avgProgress: assignments.length > 0 
      ? Math.round(assignments.reduce((sum, a) => sum + a.completion_percentage, 0) / assignments.length)
      : 0
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Program Assignments</h3>
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <Link
          href="/programs/assignments"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>

      {error ? (
        <div className="text-center py-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.avgProgress}%</div>
              <div className="text-xs text-gray-500">Avg Progress</div>
            </div>
          </div>

          {/* Recent Assignments */}
          {assignments.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Assignments</h4>
              {assignments.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {assignment.program_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {assignment.client_name}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">
                      {assignment.completion_percentage}%
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      assignment.status === 'active' ? 'bg-green-500' :
                      assignment.status === 'completed' ? 'bg-blue-500' :
                      assignment.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No assignments yet</p>
              <Link
                href="/programs/assignments"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Create your first assignment
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
