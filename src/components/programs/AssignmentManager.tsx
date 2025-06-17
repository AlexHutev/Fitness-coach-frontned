'use client';

import React, { useState, useEffect } from 'react';
import { ProgramAssignmentService } from '@/services/program-assignments';
import { ProgramAssignment, UpdateProgramAssignment, AssignmentStatus, ProgressUpdate } from '@/types/api';

interface AssignmentManagerProps {
  assignmentId: number;
  onUpdate?: (assignment: ProgramAssignment) => void;
  onCancel?: () => void;
}

export default function AssignmentManager({ 
  assignmentId, 
  onUpdate, 
  onCancel 
}: AssignmentManagerProps) {
  const [assignment, setAssignment] = useState<ProgramAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Form states
  const [status, setStatus] = useState<AssignmentStatus>('active');
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);
  const [trainerNotes, setTrainerNotes] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    setIsLoading(true);
    try {
      const data = await ProgramAssignmentService.getAssignment(assignmentId);
      setAssignment(data);
      
      // Initialize form values
      setStatus(data.status);
      setCompletionPercentage(data.completion_percentage);
      setSessionsCompleted(data.sessions_completed);
      setTrainerNotes(data.trainer_notes || '');
      setStartDate(data.start_date ? data.start_date.split('T')[0] : '');
      setEndDate(data.end_date ? data.end_date.split('T')[0] : '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {    if (!assignment) return;

    setIsUpdating(true);
    setError('');

    try {
      const updateData: UpdateProgramAssignment = {
        status,
        completion_percentage: completionPercentage,
        sessions_completed: sessionsCompleted,
        trainer_notes: trainerNotes || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const updatedAssignment = await ProgramAssignmentService.updateAssignment(
        assignmentId,
        updateData
      );
      
      setAssignment(updatedAssignment);
      if (onUpdate) {
        onUpdate(updatedAssignment);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProgressUpdate = async () => {
    if (!assignment) return;

    setIsUpdating(true);
    setError('');

    try {
      const progressData: ProgressUpdate = {
        sessions_completed: sessionsCompleted,
        completion_percentage: completionPercentage,
        notes: trainerNotes || undefined,
      };

      const updatedAssignment = await ProgramAssignmentService.updateProgress(
        assignmentId,
        progressData
      );
      
      setAssignment(updatedAssignment);
      if (onUpdate) {
        onUpdate(updatedAssignment);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!assignment || !confirm('Are you sure you want to cancel this assignment?')) return;

    setIsUpdating(true);
    try {
      await ProgramAssignmentService.cancelAssignment(assignmentId);
      if (onCancel) {
        onCancel();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel assignment');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading assignment...</span>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Assignment not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Assignment</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      <div className="space-y-6">
        {/* Assignment Info */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Program ID:</span> {assignment.program_id}
            </div>
            <div>
              <span className="font-medium">Client ID:</span> {assignment.client_id}
            </div>
            <div>
              <span className="font-medium">Assigned:</span> {new Date(assignment.assigned_date).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Total Sessions:</span> {assignment.total_sessions || 'Not set'}
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Progress */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sessions Completed
            </label>
            <input
              type="number"
              min="0"
              max={assignment.total_sessions || undefined}
              value={sessionsCompleted}
              onChange={(e) => setSessionsCompleted(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Completion Percentage
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={completionPercentage}
              onChange={(e) => setCompletionPercentage(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {/* Trainer Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trainer Notes
          </label>
          <textarea
            value={trainerNotes}
            onChange={(e) => setTrainerNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add notes about the client's progress, modifications, or observations..."
          />
        </div>

        {/* Custom Notes (Read-only) */}
        {assignment.custom_notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Notes
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
              {assignment.custom_notes}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUpdating || assignment.status === 'cancelled'}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Cancel Assignment
          </button>
          
          <div className="space-x-3">
            <button
              type="button"
              onClick={handleProgressUpdate}
              disabled={isUpdating}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update Progress'}
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
