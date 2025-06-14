import { apiClient } from '../lib/api';
import { Program, ProgramList, CreateProgram, UpdateProgram } from '../types/api';

export class ProgramService {
  // Create a new program
  static async createProgram(programData: CreateProgram): Promise<Program> {
    const response = await apiClient.post<Program>('/programs/', programData);
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
    const response = await apiClient.get<ProgramList[]>('/programs/', {
      params: params || {}
    });
    return response.data;
  }

  // Get a specific program by ID
  static async getProgram(programId: number): Promise<Program> {
    const response = await apiClient.get<Program>(`/programs/${programId}`);
    return response.data;
  }

  // Update an existing program
  static async updateProgram(programId: number, updateData: UpdateProgram): Promise<Program> {
    const response = await apiClient.put<Program>(`/programs/${programId}`, updateData);
    return response.data;
  }

  // Delete a program
  static async deleteProgram(programId: number): Promise<void> {
    await apiClient.delete(`/programs/${programId}`);
  }

  // Duplicate a program
  static async duplicateProgram(programId: number, newName: string): Promise<Program> {
    const response = await apiClient.post<Program>(`/programs/${programId}/duplicate`, null, {
      params: { new_name: newName }
    });
    return response.data;
  }

  // Search programs
  static async searchPrograms(searchTerm: string): Promise<ProgramList[]> {
    const response = await apiClient.get<ProgramList[]>('/programs/search', {
      params: { search_term: searchTerm }
    });
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
  getEstimatedDuration: (workoutDay: any): number => {
    let totalTime = 0;
    workoutDay.exercises.forEach((exercise: any) => {
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
