'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AssignmentManager from '@/components/programs/AssignmentManager';
import { ProgramAssignment } from '@/types/api';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const assignmentId = parseInt(params.id as string);

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

  if (isNaN(assignmentId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Invalid Assignment</h1>
          <p className="text-gray-600 mt-2">The assignment ID is not valid.</p>
          <button
            onClick={() => router.push('/programs/assignments')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  const handleUpdate = (assignment: ProgramAssignment) => {
    console.log('Assignment updated:', assignment);
    // Optionally show a success message or redirect
  };

  const handleCancel = () => {
    router.push('/programs/assignments');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignment Details</h1>
            <p className="text-gray-600 mt-2">
              Manage assignment #{assignmentId}
            </p>
          </div>
          <button
            onClick={() => router.push('/programs/assignments')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Assignments
          </button>
        </div>

        {/* Assignment Manager */}
        <AssignmentManager
          assignmentId={assignmentId}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
