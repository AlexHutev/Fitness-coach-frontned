// Weekly Exercise Service for Frontend
import { apiClient, API_ENDPOINTS } from '@/lib/api';

export interface WeeklyExercise {
  id: number;
  program_assignment_id: number;
  client_id: number;
  trainer_id: number;
  exercise_id: number;
  assigned_date: string;
  due_date: string | null;
  week_number: number;
  day_number: number;
  exercise_order: number;
  sets: number;
  reps: string;
  weight: string | null;
  rest_seconds: number | null;
  exercise_notes: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_date: string | null;
  actual_sets_completed: number;
  completion_percentage: number;
  client_feedback: string | null;
  trainer_feedback: string | null;
  created_at: string;
  updated_at: string | null;
  
  // Enriched data
  exercise_name: string;
  exercise_description: string;
  exercise_video_url?: string;
  exercise_instructions?: string;
  muscle_groups: string[];
  program_name: string;
  client_name: string;
  trainer_name: string;
}

export interface WeeklySchedule {
  week_start: string;
  week_end: string;
  total_exercises: number;
  completed_exercises: number;
  completion_percentage: number;
  days: {
    [key: string]: WeeklyExercise[];
  };
}

export interface ExerciseStatusUpdate {
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  client_feedback?: string;
  completion_percentage?: number;
}

export class WeeklyExerciseService {
  
  // Get current week exercises for a client
  static async getCurrentWeekExercises(clientId: number): Promise<WeeklyExercise[]> {
    const response = await apiClient.get<WeeklyExercise[]>(
      `/api/v1/weekly-exercises/client/${clientId}/current-week`
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || [];
  }
  
  // Get exercises for a specific week
  static async getWeekExercises(
    clientId: number, 
    weekStart: string,
    status?: string
  ): Promise<WeeklyExercise[]> {
    const params: any = { week_start: weekStart };
    if (status) params.status = status;
    
    const response = await apiClient.get<WeeklyExercise[]>(
      `/api/v1/weekly-exercises/client/${clientId}/week`,
      { params }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || [];
  }
  
  // Get weekly schedule (organized by days)
  static async getWeeklySchedule(
    clientId: number,
    weekStart?: string
  ): Promise<WeeklySchedule> {
    const params: any = {};
    if (weekStart) params.week_start = weekStart;
    
    const response = await apiClient.get<WeeklySchedule>(
      `/api/v1/weekly-exercises/client/${clientId}/schedule`,
      { params }
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }
  
  // Update exercise status
  static async updateExerciseStatus(
    exerciseId: number,
    statusUpdate: ExerciseStatusUpdate
  ): Promise<WeeklyExercise> {
    const response = await apiClient.put<WeeklyExercise>(
      `/api/v1/weekly-exercises/${exerciseId}/status`,
      statusUpdate
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data!;
  }
  
  // Mark exercise as completed
  static async markExerciseCompleted(
    exerciseId: number,
    feedback?: string
  ): Promise<WeeklyExercise> {
    return this.updateExerciseStatus(exerciseId, {
      status: 'completed',
      completion_percentage: 100,
      client_feedback: feedback
    });
  }
  
  // Mark exercise as skipped
  static async markExerciseSkipped(
    exerciseId: number,
    reason?: string
  ): Promise<WeeklyExercise> {
    return this.updateExerciseStatus(exerciseId, {
      status: 'skipped',
      completion_percentage: 0,
      client_feedback: reason
    });
  }
  
  // Start exercise (mark as in progress)
  static async startExercise(exerciseId: number): Promise<WeeklyExercise> {
    return this.updateExerciseStatus(exerciseId, {
      status: 'in_progress',
      completion_percentage: 0
    });
  }
}

// Utility functions
export const WeeklyExerciseUtils = {
  
  // Get status color for UI
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'skipped': return 'text-orange-600 bg-orange-100';
      case 'pending': 
      default: return 'text-gray-600 bg-gray-100';
    }
  },
  
  // Get status icon
  getStatusIcon: (status: string): string => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🏃';
      case 'skipped': return '⚠️';
      case 'pending':
      default: return '⏳';
    }
  },
  
  // Format exercise parameters
  formatExerciseDetails: (exercise: WeeklyExercise): string => {
    const parts = [];
    parts.push(`${exercise.sets} sets`);
    parts.push(`${exercise.reps} reps`);
    if (exercise.weight) parts.push(exercise.weight);
    if (exercise.rest_seconds) parts.push(`${exercise.rest_seconds}s rest`);
    return parts.join(' × ');
  },
  
  // Get day name from day number
  getDayName: (dayNumber: number): string => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNumber - 1] || `Day ${dayNumber}`;
  },
  
  // Format date for display
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  },
  
  // Calculate week progress
  calculateWeekProgress: (exercises: WeeklyExercise[]): number => {
    if (exercises.length === 0) return 0;
    const completed = exercises.filter(ex => ex.status === 'completed').length;
    return Math.round((completed / exercises.length) * 100);
  }
};
