import { apiClient, API_ENDPOINTS } from '../lib/api';
import { Exercise, ExerciseList, CreateExercise, UpdateExercise } from '../types/api';

export class ExerciseService {
  // Create a new exercise
  static async createExercise(exerciseData: CreateExercise): Promise<Exercise> {
    const response = await apiClient.post<Exercise>(API_ENDPOINTS.EXERCISES, exerciseData);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  // Get exercises with filters
  static async getExercises(params?: {
    skip?: number;
    limit?: number;
    muscle_group?: string;
    equipment?: string;
    difficulty_level?: string;
    search_term?: string;
    created_by_me?: boolean;
    is_public?: boolean;
  }): Promise<ExerciseList[]> {
    const response = await apiClient.get<ExerciseList[]>(API_ENDPOINTS.EXERCISES, { params });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Get public exercises (no auth required)
  static async getPublicExercises(params?: {
    skip?: number;
    limit?: number;
    muscle_group?: string;
    equipment?: string;
    difficulty_level?: string;
    search_term?: string;
  }): Promise<ExerciseList[]> {
    const response = await apiClient.get<ExerciseList[]>(API_ENDPOINTS.EXERCISES_PUBLIC, { params });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Get a specific exercise by ID
  static async getExercise(exerciseId: number): Promise<Exercise> {
    const response = await apiClient.get<Exercise>(API_ENDPOINTS.EXERCISE_BY_ID(exerciseId));
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  // Update an existing exercise
  static async updateExercise(exerciseId: number, updateData: UpdateExercise): Promise<Exercise> {
    const response = await apiClient.put<Exercise>(API_ENDPOINTS.EXERCISE_BY_ID(exerciseId), updateData);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  }

  // Delete an exercise
  static async deleteExercise(exerciseId: number): Promise<void> {
    const response = await apiClient.delete(API_ENDPOINTS.EXERCISE_BY_ID(exerciseId));
    if (response.error) {
      throw new Error(response.error);
    }
  }

  // Get multiple exercises by their IDs
  static async getExercisesByIds(exerciseIds: number[]): Promise<ExerciseList[]> {
    const response = await apiClient.post<ExerciseList[]>(API_ENDPOINTS.EXERCISES_BULK, exerciseIds);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Get available muscle groups
  static async getMuscleGroups(): Promise<string[]> {
    const response = await apiClient.get<string[]>(API_ENDPOINTS.EXERCISES_MUSCLE_GROUPS);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Get available equipment types
  static async getEquipmentTypes(): Promise<string[]> {
    const response = await apiClient.get<string[]>(API_ENDPOINTS.EXERCISES_EQUIPMENT_TYPES);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }
}

// Exercise utility functions
export const ExerciseUtils = {
  // Format muscle groups for display
  formatMuscleGroups: (muscleGroups: string[]): string => {
    return muscleGroups.map(group => 
      group.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ).join(', ');
  },

  // Format equipment for display
  formatEquipment: (equipment: string[]): string => {
    return equipment.map(item => 
      item.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ).join(', ');
  },

  // Get difficulty color
  getDifficultyColor: (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
};