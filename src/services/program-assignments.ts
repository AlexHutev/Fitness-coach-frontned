import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  ProgramAssignment,
  ProgramAssignmentWithDetails,
  ProgramAssignmentList,
  CreateProgramAssignment,
  UpdateProgramAssignment,
  ProgressUpdate,
  BulkAssignmentRequest,
  AssignmentStatus
} from '@/types/api';

export class ProgramAssignmentService {
  // Assign a program to multiple clients
  static async assignProgram(
    programId: number,
    clientIds: number[],
    startDate?: string,
    customNotes?: string
  ): Promise<ProgramAssignment[]> {
    const response = await apiClient.post<ProgramAssignment[]>(
      API_ENDPOINTS.PROGRAM_ASSIGN(programId),
      {
        client_ids: clientIds,
        start_date: startDate,
        custom_notes: customNotes
      }
    );
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to assign program');
    }
    return response.data;
  }

  // Get all program assignments for the current trainer
  static async getAssignments(params?: {
    skip?: number;
    limit?: number;
    client_id?: number;
    status?: AssignmentStatus;
  }): Promise<ProgramAssignmentWithDetails[]> {
    // Convert enum to string for API call
    const apiParams: Record<string, any> = {};
    if (params) {
      if (params.skip !== undefined) apiParams.skip = params.skip;
      if (params.limit !== undefined) apiParams.limit = params.limit;
      if (params.client_id !== undefined) apiParams.client_id = params.client_id;
      if (params.status !== undefined) apiParams.status = params.status.toString();
    }

    const response = await apiClient.get<ProgramAssignmentWithDetails[]>(
      API_ENDPOINTS.PROGRAM_ASSIGNMENTS,
      { params: apiParams }
    );
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch assignments');
    }
    return response.data;
  }

  // Get a specific assignment by ID
  static async getAssignment(assignmentId: number): Promise<ProgramAssignment> {
    const response = await apiClient.get<ProgramAssignment>(
      API_ENDPOINTS.PROGRAM_ASSIGNMENT_BY_ID(assignmentId)
    );
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch assignment');
    }
    return response.data;
  }
  // Update an assignment
  static async updateAssignment(
    assignmentId: number,
    updateData: UpdateProgramAssignment
  ): Promise<ProgramAssignment> {
    const response = await apiClient.put<ProgramAssignment>(
      API_ENDPOINTS.PROGRAM_ASSIGNMENT_BY_ID(assignmentId),
      updateData
    );
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update assignment');
    }
    return response.data;
  }

  // Update assignment progress
  static async updateProgress(
    assignmentId: number,
    progressData: ProgressUpdate
  ): Promise<ProgramAssignment> {
    const response = await apiClient.put<ProgramAssignment>(
      API_ENDPOINTS.PROGRAM_ASSIGNMENT_PROGRESS(assignmentId),
      progressData
    );
    
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update progress');
    }
    return response.data;
  }

  // Cancel an assignment
  static async cancelAssignment(assignmentId: number): Promise<void> {
    const response = await apiClient.delete(
      API_ENDPOINTS.PROGRAM_ASSIGNMENT_BY_ID(assignmentId)
    );
    
    if (response.error) {
      throw new Error(response.error || 'Failed to cancel assignment');
    }
  }

  // Get client's active assignment
  static async getClientActiveAssignment(clientId: number): Promise<ProgramAssignment | null> {
    const response = await apiClient.get<ProgramAssignment | null>(
      API_ENDPOINTS.CLIENT_ACTIVE_ASSIGNMENT(clientId)
    );
    
    if (response.error) {
      throw new Error(response.error || 'Failed to fetch client assignment');
    }
    return response.data || null;
  }
}
