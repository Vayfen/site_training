import api from './api';
import { TrainingPlan, Workout } from '../types';

export const trainingService = {
  // Training Plans
  async getTrainingPlans(): Promise<TrainingPlan[]> {
    const response = await api.get<TrainingPlan[]>('/training-plans');
    return response.data;
  },

  async getTrainingPlan(id: number): Promise<TrainingPlan> {
    const response = await api.get<TrainingPlan>(`/training-plans/${id}`);
    return response.data;
  },

  async generateTrainingPlan(data: {
    goal_id: number;
    start_date?: string;
    additional_notes?: string;
  }): Promise<TrainingPlan> {
    const response = await api.post<TrainingPlan>('/training-plans/generate', data);
    return response.data;
  },

  async deleteTrainingPlan(id: number): Promise<void> {
    await api.delete(`/training-plans/${id}`);
  },

  // Workouts
  async getWorkouts(params?: {
    upcoming?: boolean;
    completed?: boolean;
  }): Promise<Workout[]> {
    const response = await api.get<Workout[]>('/workouts', { params });
    return response.data;
  },

  async getWeekWorkouts(weekOffset = 0): Promise<Workout[]> {
    const response = await api.get<Workout[]>('/workouts/week', {
      params: { week_offset: weekOffset },
    });
    return response.data;
  },

  async getWorkout(id: number): Promise<Workout> {
    const response = await api.get<Workout>(`/workouts/${id}`);
    return response.data;
  },

  async completeWorkout(
    id: number,
    data: {
      actual_distance_km?: number;
      actual_duration_minutes?: number;
      perceived_effort?: number;
      notes?: string;
    }
  ): Promise<Workout> {
    const response = await api.post<Workout>(`/workouts/${id}/complete`, data);
    return response.data;
  },

  async uncompleteWorkout(id: number): Promise<Workout> {
    const response = await api.post<Workout>(`/workouts/${id}/uncomplete`);
    return response.data;
  },
};
