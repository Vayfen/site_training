export interface User {
  id: number;
  email: string;
  full_name: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  weekly_availability_hours: number;
  preferred_training_days: number;
  pr_5k: number | null;
  pr_10k: number | null;
  pr_half_marathon: number | null;
  pr_marathon: number | null;
  prefers_trail: string;
  max_distance_km: number;
  created_at: string;
}

export interface UserStats {
  total_workouts: number;
  completed_workouts: number;
  total_distance_km: number;
  total_duration_hours: number;
  completion_rate: number;
  current_week_workouts: number;
  active_goals: number;
}

export interface Goal {
  id: number;
  user_id: number;
  name: string;
  race_type: string;
  target_date: string;
  target_time_seconds: number | null;
  race_name: string | null;
  race_location: string | null;
  distance_km: number;
  elevation_gain_m: number;
  priority: 'low' | 'medium' | 'high';
  is_active: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  days_until_race?: number;
  weeks_until_race?: number;
  has_training_plan?: boolean;
  training_completion_rate?: number | null;
}

export interface TrainingPlan {
  id: number;
  user_id: number;
  goal_id: number;
  name: string;
  description: string;
  duration_weeks: number;
  start_date: string;
  end_date: string;
  generated_by_ai: boolean;
  created_at: string;
  updated_at: string;
  workouts?: Workout[];
  total_workouts?: number;
  completed_workouts?: number;
  completion_rate?: number;
}

export interface Workout {
  id: number;
  training_plan_id: number;
  name: string;
  workout_type: string;
  scheduled_date: string;
  week_number: number;
  day_of_week: number;
  description: string;
  distance_km: number | null;
  duration_minutes: number | null;
  intensity: string;
  warmup_description: string | null;
  main_set_description: string;
  cooldown_description: string | null;
  target_pace_min: number | null;
  target_pace_max: number | null;
  is_completed: boolean;
  completed_at: string | null;
  actual_distance_km: number | null;
  actual_duration_minutes: number | null;
  perceived_effort: number | null;
  notes: string | null;
  suggested_route_id: number | null;
  created_at: string;
}

export interface Route {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  distance_km: number;
  elevation_gain_m: number;
  elevation_loss_m: number;
  route_type: string;
  surface_type: string | null;
  start_location: string | null;
  start_lat: number | null;
  start_lng: number | null;
  route_data: any;
  generated_by_ai: boolean;
  difficulty_rating: number;
  scenic_rating: number | null;
  times_used: number;
  is_favorite: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
