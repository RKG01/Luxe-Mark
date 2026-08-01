import { api } from './api';
import { Order, OrderStatus } from '../types';

export const adminService = {
  async getAllOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/admin/orders');
    return response.data;
  },

  async getOrderById(id: number): Promise<Order> {
    const response = await api.get<Order>(`/admin/orders/${id}`);
    return response.data;
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await api.put<Order>(`/admin/orders/${id}/status`, {
      status,
    });
    return response.data;
  },
};
