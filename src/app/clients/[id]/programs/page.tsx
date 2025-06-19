'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClientService } from '@/services/clients';
import { ProgramAssignmentService } from '@/services/program-assignments';
import { ProgramService } from '@/services/programs';
import { withAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Clock, 
  Target,
  Activity,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  MoreHorizontal
} from 'lucide-react';
import { 
  Client, 
  ProgramAssignmentWithDetails, 
  ProgramList,
  AssignmentStatus 
} from '@/types/api';

function ClientProgramsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = parseInt(params.id as string);

  const [client, setClient] = useState<Client | null>(null);
  const [assignments, setAssignments] = useState<ProgramAssignmentWithDetails[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<ProgramList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load client data and assignments in parallel
      const [clientData, assignmentsData, programsData] = await Promise.all([
        ClientService.getClientById(clientId),
        ProgramAssignmentService.getAssignments({ client_id: clientId }),
        ProgramService.getPrograms({ is_template: true })
      ]);

      setClient(clientData);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      setAvailablePrograms(Array.isArray(programsData) ? programsData : []);
    } catch (err) {
      console.error('Error loading client programs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setClient(null);
      setAssignments([]);
      setAvailablePrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignProgram = async (programId: number) => {
    try {
      await ProgramAssignmentService.assignProgram(programId, [clientId]);
      setShowAssignModal(false);
      loadData(); // Reload data to show new assignment
    } catch (err) {
      console.error('Error assigning program:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign program');
    }
  };

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'paused':
        return <PauseCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error loading data</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link 
              href="/clients"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Clients
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {client?.first_name} {client?.last_name} - Programs
              </h1>
              <p className="text-gray-600 mt-1">
                Manage training programs for this client
              </p>
            </div>
            
            <button
              onClick={() => setShowAssignModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Assign Program
            </button>
          </div>
        </div>

        {/* Active Assignment Alert */}
        {assignments.some(a => a.status === 'active') && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="text-green-800 font-medium">Active Program Assignment</h3>
                <p className="text-green-700 text-sm">
                  This client currently has an active training program.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Program Assignments */}
        <div className="space-y-6">
          {assignments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Programs Assigned
              </h3>
              <p className="text-gray-600 mb-6">
                This client doesn't have any training programs assigned yet.
              </p>
              <button
                onClick={() => setShowAssignModal(true)}
                className="btn-primary"
              >
                Assign First Program
              </button>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 mr-3">
                        {assignment.program_name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(assignment.status)}`}>
                        {getStatusIcon(assignment.status)}
                        <span className="ml-1">{assignment.status}</span>
                      </span>
                    </div>
                    
                    {assignment.program_description && (
                      <p className="text-gray-600 mb-3">{assignment.program_description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Started: {formatDate(assignment.assigned_date)}
                      </div>
                      
                      {assignment.start_date && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          Start: {formatDate(assignment.start_date)}
                        </div>
                      )}
                      
                      {assignment.end_date && (
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          End Date: {formatDate(assignment.end_date)}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Activity className="w-4 h-4 mr-2" />
                        Progress: {assignment.completion_percentage || 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {assignment.custom_notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Notes:</h4>
                    <p className="text-sm text-gray-700">{assignment.custom_notes}</p>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-3">
                  <Link
                    href={`/programs/assignments/${assignment.id}`}
                    className="btn-secondary text-sm"
                  >
                    View Details
                  </Link>
                  {assignment.status === 'active' && (
                    <Link
                      href={`/programs/assignments/${assignment.id}/progress`}
                      className="btn-primary text-sm"
                    >
                      Track Progress
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Assign Program Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Assign Program to {client?.first_name}
                </h3>
                
                {availablePrograms.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">No programs available to assign.</p>
                    <Link
                      href="/programs/create"
                      className="btn-primary text-sm"
                    >
                      Create a Program
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {availablePrograms.map((program) => (
                      <div 
                        key={program.id}
                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleAssignProgram(program.id)}
                      >
                        <h4 className="font-medium text-gray-900">{program.name}</h4>
                        {program.description && (
                          <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="mr-3">{program.difficulty_level}</span>
                          <span>{program.duration_weeks} weeks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ClientProgramsPage);
