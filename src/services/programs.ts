import { apiClient, API_ENDPOINTS } from '../lib/api';
import { Program, ProgramList, CreateProgram, UpdateProgram, WorkoutDay, ExerciseInWorkout } from '../types/api';

export class ProgramService {
  // Create a new program
  static async createProgram(programData: CreateProgram): Promise<Program> {
    const response = await apiClient.post<Program>(API_ENDPOINTS.PROGRAMS, programData);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to create program');
    }
    return response.data;
  }

  // Get all programs for the current trainer
  static async getPrograms(params?: {
    skip?: number;
    limit?: number;
    program_type?: string;
    difficulty_level?: string;
    is_template?: boolean;
  }): Promise<ProgramList[]> {
    const response = await apiClient.get<ProgramList[]>(API_ENDPOINTS.PROGRAMS, { params });
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch programs');
    }
    return response.data;
  }

  // Get a specific program by ID
  static async getProgram(programId: number): Promise<Program> {
    const response = await apiClient.get<Program>(API_ENDPOINTS.PROGRAM_BY_ID(programId));
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch program');
    }
    return response.data;
  }

  // Update an existing program
  static async updateProgram(programId: number, updateData: UpdateProgram): Promise<Program> {
    const response = await apiClient.put<Program>(API_ENDPOINTS.PROGRAM_BY_ID(programId), updateData);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to update program');
    }
    return response.data;
  }

  // Delete a program
  static async deleteProgram(programId: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.PROGRAM_BY_ID(programId));
    if (response.error) {
      throw new Error(response.error || 'Failed to delete program');
    }
  }

  // Duplicate a program
  static async duplicateProgram(programId: number, newName: string): Promise<Program> {
    const response = await apiClient.post<Program>(API_ENDPOINTS.PROGRAM_DUPLICATE(programId), null, { params: { new_name: newName } });
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to duplicate program');
    }
    return response.data;
  }

  // Search programs
  static async searchPrograms(searchTerm: string): Promise<ProgramList[]> {
    const response = await apiClient.get<ProgramList[]>(API_ENDPOINTS.PROGRAMS_SEARCH, { params: { search_term: searchTerm } });
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to search programs');
    }
    return response.data;
  }
}
// Program utility functions
export const ProgramUtils = {
  // Calculate total exercises in a program
  getTotalExercises: (program: Program): number => {
    return program.workout_structure.reduce((total, day) => total + day.exercises.length, 0);
  },

  // Calculate estimated workout time for a day
  getEstimatedDuration: (workoutDay: WorkoutDay): number => {
    let totalTime = 0;
    workoutDay.exercises.forEach((exercise: ExerciseInWorkout) => {
      // Estimate 30 seconds per set + rest time
      const exerciseTime = (exercise.sets * 30) + (exercise.sets * exercise.rest_seconds);
      totalTime += exerciseTime;
    });
    return Math.round(totalTime / 60); // Return in minutes
  },

  // Format difficulty level for display
  formatDifficulty: (difficulty: string): string => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  },

  // Format program type for display
  formatProgramType: (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
};