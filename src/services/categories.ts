import { api } from './api';
import { Category } from '../types';

export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  async getCategoryById(id: number): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  async createCategory(data: Omit<Category, 'id'>): Promise<Category> {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  async updateCategory(id: number, data: Omit<Category, 'id'>): Promise<Category> {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
