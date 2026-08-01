import { api } from './api';
import { Address } from '../types';

export const addressesService = {
  async getAddresses(): Promise<Address[]> {
    const response = await api.get<Address[]>('/addresses');
    return response.data;
  },

  async getAddressById(id: number): Promise<Address> {
    const response = await api.get<Address>(`/addresses/${id}`);
    return response.data;
  },

  async createAddress(data: Omit<Address, 'id'>): Promise<Address> {
    const response = await api.post<Address>('/addresses', data);
    return response.data;
  },

  async updateAddress(id: number, data: Omit<Address, 'id'>): Promise<Address> {
    const response = await api.put<Address>(`/addresses/${id}`, data);
    return response.data;
  },

  async deleteAddress(id: number): Promise<void> {
    await api.delete(`/addresses/${id}`);
  },
};
