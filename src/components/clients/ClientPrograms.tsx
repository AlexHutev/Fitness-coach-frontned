import React, { useState, useEffect } from 'react';
import { ProgramAssignmentService } from '@/services/program-assignments';
import { ProgramAssignmentWithDetails, AssignmentStatus } from '@/types/api';
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle,
  Plus,
  MoreVertical,
  Dumbbell
} from 'lucide-react';

interface ClientProgramsProps {
  clientId: number;
  onAssignProgram: () => void;
}

interface WorkoutDay {
  day: number;
  name: string;
  exercises: {
    exercise_id: number;
    exercise_name: string;
    sets: number;
    reps: string;
    weight: string;
    rest_seconds: number;
    notes?: string;
  }[];
}

export default function ClientPrograms({ clientId, onAssignProgram }: ClientProgramsProps) {
  const [assignments, setAssignments] = useState<ProgramAssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null);

  useEffect(() => {
    loadClientPrograms();
  }, [clientId]);

  const loadClientPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await ProgramAssignmentService.getAssignments({
        client_id: clientId,
        limit: 50
      });
      
      setAssignments(data);
    } catch (err) {
      console.error('Error loading client programs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleProgramExpansion = (assignmentId: number) => {
    setExpandedProgram(expandedProgram === assignmentId ? null : assignmentId);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Loading programs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
        <div className="text-center py-8">
          <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Programs</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadClientPrograms}
            className="btn-secondary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Programs Assigned</h3>
          <p className="text-gray-600 mb-6">
            This client doesn't have any training programs assigned yet.
          </p>
          <button 
            onClick={onAssignProgram}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Assign Program</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Training Programs</h3>
        <button 
          onClick={onAssignProgram}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Assign New Program</span>
        </button>
      </div>

      {/* Programs List */}
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-xl shadow-card border border-gray-100">
            {/* Program Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {assignment.program_name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1 ${getStatusColor(assignment.status)}`}>
                      {getStatusIcon(assignment.status)}
                      <span className="capitalize">{assignment.status}</span>
                    </span>
                  </div>
                  
                  {assignment.program_description && (
                    <p className="text-gray-600 text-sm mb-3">{assignment.program_description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Assigned {formatDate(assignment.assigned_date)}
                    </span>
                    {assignment.start_date && (
                      <span className="flex items-center">
                        <Play className="w-4 h-4 mr-1" />
                        Started {formatDate(assignment.start_date)}
                      </span>
                    )}
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {assignment.completion_percentage}% Complete
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleProgramExpansion(assignment.id)}
                  className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Workout Details (Expandable) */}
            {expandedProgram === assignment.id && assignment.workout_structure && (
              <div className="p-6 bg-gray-50">
                <h5 className="font-medium text-gray-900 mb-4">Workout Schedule</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(assignment.workout_structure as WorkoutDay[]).map((day) => (
                    <div key={day.day} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h6 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Dumbbell className="w-4 h-4 mr-2 text-blue-600" />
                        {day.name}
                      </h6>
                      <div className="space-y-2">
                        {day.exercises.map((exercise, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-gray-800">{exercise.exercise_name}</div>
                            <div className="text-gray-600 text-xs">
                              {exercise.sets} sets × {exercise.reps} reps 
                              {exercise.weight && ` @ ${exercise.weight}`}
                              {exercise.rest_seconds && ` • ${exercise.rest_seconds}s rest`}
                            </div>
                            {exercise.notes && (
                              <div className="text-gray-500 text-xs italic mt-1">
                                {exercise.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {assignment.custom_notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h6 className="font-medium text-blue-900 text-sm mb-1">Trainer Notes</h6>
                    <p className="text-blue-800 text-sm">{assignment.custom_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
