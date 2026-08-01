import { api } from './api';
import { Cart } from '../types';

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await api.get<Cart>('/cart');
    return response.data;
  },

  async addToCart(productId: number, quantity: number): Promise<Cart> {
    const response = await api.post<Cart>('/cart/add', {
      productId,
      quantity,
    });
    return response.data;
  },

  /**
   * NOTE: The backend DELETE /cart/items/{itemId} endpoint expects the database
   * primary key of the CartItem (cartItemId). However, the backend CartItemResponse
   * does not expose this ID, only the productId. 
   * As a fallback, the frontend will pass the productId as the itemId. If the backend
   * returns a 404/500 due to this mismatch, we will catch it in the UI and show a
   * descriptive error.
   */
  async removeFromCart(itemId: number): Promise<void> {
    await api.delete(`/cart/items/${itemId}`);
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart/clear');
  },
};
