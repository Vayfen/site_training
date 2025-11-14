import api from './api';
import { User, UserStats } from '../types';

export const usersService = {
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },

  async getStats(): Promise<UserStats> {
    const response = await api.get<UserStats>('/users/me/stats');
    return response.data;
  },
};
