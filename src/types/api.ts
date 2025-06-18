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
  role: 'trainer' | 'client' | 'admin';
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
  custom_password?: string;
}

export interface CreateClientAccountRequest {
  email: string;
  custom_password?: string;
}

export interface ClientAccountCreationResponse {
  client: Client;
  user_account: {
    id: number;
    email: string;
    temporary_password: string;
  };
  message: string;
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


// Program Assignment types
export type AssignmentStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface ProgramAssignment {
  id: number;
  program_id: number;
  client_id: number;
  trainer_id: number;
  assigned_date: string;
  start_date?: string;
  end_date?: string;
  status: AssignmentStatus;
  custom_notes?: string;
  trainer_notes?: string;
  completion_percentage: number;
  sessions_completed: number;
  total_sessions?: number;
  created_at: string;
  updated_at?: string;
}

export interface ProgramAssignmentWithDetails extends ProgramAssignment {
  program_name: string;
  program_type: string;
  program_difficulty: string;
  program_description?: string;
  workout_structure?: WorkoutDay[];
  client_name: string;
  client_email?: string;
}

export interface ProgramAssignmentList {
  id: number;
  program_id: number;
  program_name: string;
  client_id: number;
  client_name: string;
  status: AssignmentStatus;
  assigned_date: string;
  start_date?: string;
  completion_percentage: number;
}

export interface CreateProgramAssignment {
  program_id: number;
  client_id: number;
  start_date?: string;
  end_date?: string;
  custom_notes?: string;
  trainer_notes?: string;
}

export interface UpdateProgramAssignment {
  start_date?: string;
  end_date?: string;
  status?: AssignmentStatus;
  custom_notes?: string;
  trainer_notes?: string;
  completion_percentage?: number;
  sessions_completed?: number;
  total_sessions?: number;
}

export interface ProgressUpdate {
  sessions_completed: number;
  completion_percentage: number;
  notes?: string;
}

export interface BulkAssignmentRequest {
  program_id: number;
  client_ids: number[];
  start_date?: string;
  custom_notes?: string;
}
// Client Authentication Types
export interface ClientLoginRequest {
  email: string;
  password: string;
}

export interface ClientTokenResponse {
  access_token: string;
  token_type: string;
  client_id: number;
  assignment_id: number;
  program_name: string;
}

// Client Dashboard Types
export interface ClientDashboardProgram {
  assignment_id: number;
  program_id: number;
  program_name: string;
  program_description?: string;
  program_type: string;
  difficulty_level: string;
  start_date: string;
  end_date?: string;
  status: AssignmentStatus;
  total_workouts: number;
  completed_workouts: number;
  completion_percentage: number;
  last_workout_date?: string;
  next_workout_day?: number;
}

export interface ClientProgressStats {
  total_programs: number;
  active_programs: number;
  completed_programs: number;
  total_workouts_completed: number;
  current_streak: number;
  longest_streak: number;
  average_workout_duration?: number;
  average_perceived_exertion?: number;
}

export interface ClientDashboardResponse {
  client_id: number;
  client_name: string;
  active_programs: ClientDashboardProgram[];
  recent_workouts: WorkoutLogResponse[];
  progress_stats: ClientProgressStats;
}

// Workout Tracking Types
export interface ExerciseSetData {
  set: number;
  reps: number;
  weight?: string;
  completed: boolean;
  notes?: string;
  rest_seconds?: number;
}

export interface ExerciseLogCreate {
  exercise_name: string;
  exercise_id?: number;
  exercise_order: number;
  planned_sets?: number;
  planned_reps?: string;
  planned_weight?: string;
  planned_rest_seconds?: number;
  actual_sets: ExerciseSetData[];
  difficulty_rating?: number;
  exercise_notes?: string;
  form_rating?: number;
}

export interface WorkoutLogCreate {
  assignment_id: number;
  day_number: number;
  workout_name?: string;
  workout_date?: string;
  total_duration_minutes?: number;
  perceived_exertion?: number;
  client_notes?: string;
  is_completed: boolean;
  is_skipped: boolean;
  skip_reason?: string;
  exercises: ExerciseLogCreate[];
}

export interface ExerciseLogResponse {
  id: number;
  exercise_name: string;
  exercise_id?: number;
  exercise_order: number;
  planned_sets?: number;
  planned_reps?: string;
  planned_weight?: string;
  planned_rest_seconds?: number;
  actual_sets: any[];
  difficulty_rating?: number;
  exercise_notes?: string;
  form_rating?: number;
  created_at: string;
}

export interface WorkoutLogResponse {
  id: number;
  assignment_id: number;
  client_id: number;
  workout_date: string;
  day_number: number;
  workout_name?: string;
  total_duration_minutes?: number;
  perceived_exertion?: number;
  client_notes?: string;
  trainer_feedback?: string;
  is_completed: boolean;
  is_skipped: boolean;
  skip_reason?: string;
  exercises: ExerciseLogResponse[];
  created_at: string;
}

// Program Template Types (for client view)
export interface WorkoutExerciseTemplate {
  exercise_id?: number;
  exercise_name: string;
  sets: number;
  reps: string;
  weight?: string;
  rest_seconds: number;
  notes?: string;
  muscle_groups?: string[];
  equipment?: string[];
  instructions?: string;
}

export interface WorkoutDayTemplate {
  day: number;
  name: string;
  exercises: WorkoutExerciseTemplate[];
}

export interface ProgramTemplateForClient {
  program_id: number;
  assignment_id: number;
  program_name: string;
  program_description?: string;
  program_type: string;
  difficulty_level: string;
  duration_weeks?: number;
  sessions_per_week?: number;
  workout_structure: WorkoutDayTemplate[];
  trainer_notes?: string;
}

// Client Context Types
export interface ClientAuthContextType {
  clientId: number | null;
  assignmentId: number | null;
  programName: string | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}
