import { api } from './api';
import { Order } from '../types';

export const ordersService = {
  async checkout(addressId: number): Promise<Order> {
    const response = await api.post<Order>('/orders/checkout', {
      addressId,
    });
    return response.data;
  },

  async getOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  async getOrderById(id: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async cancelOrder(id: number): Promise<Order> {
    const response = await api.put<Order>(`/orders/${id}/cancel`);
    return response.data;
  },
};
