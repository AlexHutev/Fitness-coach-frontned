// Type definitions for API responses and data models

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  specialization?: string;
  experience?: string;
  bio?: string;
  is_active: boolean;
  is_verified: boolean;
  role: 'TRAINER' | 'ADMIN';
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  specialization?: 'personal-training' | 'strength-conditioning' | 'weight-loss' | 'bodybuilding' | 'functional-fitness' | 'sports-specific' | 'rehabilitation' | 'nutrition' | 'other';
  experience?: 'beginner' | 'intermediate' | 'experienced' | 'expert';
  bio?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Client {
  id: number;
  trainer_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number; // in cm
  weight?: number; // in kg
  body_fat_percentage?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  primary_goal?: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness' | 'rehabilitation';
  secondary_goals?: string;
  medical_conditions?: string;
  injuries?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ClientSummary {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  primary_goal?: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateClientRequest {
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  body_fat_percentage?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  primary_goal?: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'endurance' | 'strength' | 'general_fitness' | 'rehabilitation';
  secondary_goals?: string;
  medical_conditions?: string;
  injuries?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  specialization?: string;
  experience?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ApiError {
  detail: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}

// Authentication context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: UpdateUserRequest) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}
// Program and Exercise types
export type ProgramType = 'strength' | 'cardio' | 'flexibility' | 'functional' | 'sports_specific' | 'rehabilitation' | 'mixed';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseInWorkout {
  exercise_id: number;
  sets: number;
  reps: string;
  weight: string;
  rest_seconds: number;
  notes?: string;
}

export interface WorkoutDay {
  day: number;
  name: string;
  exercises: ExerciseInWorkout[];
}

export interface Program {
  id: number;
  trainer_id: number;
  name: string;
  description?: string;
  program_type: ProgramType;
  difficulty_level: DifficultyLevel;
  duration_weeks?: number;
  sessions_per_week?: number;
  workout_structure: WorkoutDay[];
  tags?: string;
  equipment_needed?: string[];
  is_template: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProgramList {
  id: number;
  name: string;
  program_type: ProgramType;
  difficulty_level: DifficultyLevel;
  duration_weeks?: number;
  sessions_per_week?: number;
  is_template: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  instructions?: string;
  muscle_groups?: string[];
  equipment?: string[];
  difficulty_level?: DifficultyLevel;
  image_url?: string;
  video_url?: string;
  created_by?: number;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ExerciseList {
  id: number;
  name: string;
  muscle_groups?: string[];
  equipment?: string[];
  difficulty_level?: DifficultyLevel;
  is_public: boolean;
}

// Create/Update types
export interface CreateProgram {
  name: string;
  description?: string;
  program_type: ProgramType;
  difficulty_level: DifficultyLevel;
  duration_weeks?: number;
  sessions_per_week?: number;
  workout_structure: WorkoutDay[];
  tags?: string;
  equipment_needed?: string[];
  is_template?: boolean;
}

export interface UpdateProgram {
  name?: string;
  description?: string;
  program_type?: ProgramType;
  difficulty_level?: DifficultyLevel;
  duration_weeks?: number;
  sessions_per_week?: number;
  workout_structure?: WorkoutDay[];
  tags?: string;
  equipment_needed?: string[];
  is_template?: boolean;
  is_active?: boolean;
}

export interface CreateExercise {
  name: string;
  description?: string;
  instructions?: string;
  muscle_groups?: string[];
  equipment?: string[];
  difficulty_level?: DifficultyLevel;
  image_url?: string;
  video_url?: string;
  is_public?: boolean;
}

export interface UpdateExercise {
  name?: string;
  description?: string;
  instructions?: string;
  muscle_groups?: string[];
  equipment?: string[];
  difficulty_level?: DifficultyLevel;
  image_url?: string;
  video_url?: string;
  is_public?: boolean;
}
