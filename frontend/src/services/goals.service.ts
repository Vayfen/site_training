import api from './api';
import { Goal } from '../types';

export const goalsService = {
  async getGoals(activeOnly = false): Promise<Goal[]> {
    const response = await api.get<Goal[]>('/goals', {
      params: { active_only: activeOnly },
    });
    return response.data;
  },

  async getGoal(id: number): Promise<Goal> {
    const response = await api.get<Goal>(`/goals/${id}`);
    return response.data;
  },

  async createGoal(data: Partial<Goal>): Promise<Goal> {
    const response = await api.post<Goal>('/goals', data);
    return response.data;
  },

  async updateGoal(id: number, data: Partial<Goal>): Promise<Goal> {
    const response = await api.put<Goal>(`/goals/${id}`, data);
    return response.data;
  },

  async deleteGoal(id: number): Promise<void> {
    await api.delete(`/goals/${id}`);
  },
};
