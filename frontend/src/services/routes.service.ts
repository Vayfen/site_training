import api from './api';
import { Route } from '../types';

export const routesService = {
  async getRoutes(favoritesOnly = false): Promise<Route[]> {
    const response = await api.get<Route[]>('/routes', {
      params: { favorites_only: favoritesOnly },
    });
    return response.data;
  },

  async getRoute(id: number): Promise<Route> {
    const response = await api.get<Route>(`/routes/${id}`);
    return response.data;
  },

  async generateRoute(data: {
    distance_km: number;
    route_type?: string;
    start_location?: string;
    start_lat?: number;
    start_lng?: number;
    elevation_preference?: string;
    loop?: boolean;
  }): Promise<Route> {
    const response = await api.post<Route>('/routes/generate', data);
    return response.data;
  },

  async toggleFavorite(id: number): Promise<Route> {
    const response = await api.post<Route>(`/routes/${id}/favorite`);
    return response.data;
  },

  async deleteRoute(id: number): Promise<void> {
    await api.delete(`/routes/${id}`);
  },
};
