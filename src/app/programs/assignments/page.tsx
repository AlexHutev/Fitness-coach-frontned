'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProgramAssignmentList from '@/components/programs/ProgramAssignmentList';
import ProgramAssign from '@/components/programs/ProgramAssign';
import { ProgramAssignmentWithDetails } from '@/types/api';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'list' | 'assign'>('list');
  const [refreshKey, setRefreshKey] = useState(0);

  // Check if we have a client parameter to auto-switch to assign tab and pre-select client
  useEffect(() => {
    const programParam = searchParams.get('program');
    const clientParam = searchParams.get('client');
    if (programParam || clientParam) {
      setActiveTab('assign');
    }
  }, [searchParams]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You must be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  const handleAssignmentComplete = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('list');
  };

  const handleAssignmentSelect = (assignment: ProgramAssignmentWithDetails) => {
    // You could navigate to a detailed view here
    console.log('Selected assignment:', assignment);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Program Assignments</h1>
          <p className="text-gray-600 mt-2">
            Manage and track program assignments for your clients
            {searchParams.get('client') && (
              <span className="block mt-1 text-blue-600 font-medium">
                Ready to assign a program to the selected client
              </span>
            )}
            {searchParams.get('program') && (
              <span className="block mt-1 text-blue-600 font-medium">
                Ready to assign the selected program to clients
              </span>
            )}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('list')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Assignments
            </button>
            <button
              onClick={() => setActiveTab('assign')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assign'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assign Program
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'list' && (
            <ProgramAssignmentList
              key={refreshKey}
              onAssignmentSelect={handleAssignmentSelect}
            />
          )}
          {activeTab === 'assign' && (
            <ProgramAssign 
              onAssignmentComplete={handleAssignmentComplete}
              preselectedProgramId={searchParams.get('program') ? parseInt(searchParams.get('program')!) : undefined}
              preselectedClientIds={searchParams.get('client') ? [parseInt(searchParams.get('client')!)] : []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
