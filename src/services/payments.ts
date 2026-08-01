import { api } from './api';
import { PaymentInitResponse, PaymentVerifyResponse, PaymentMethod } from '../types';

export const paymentsService = {
  async createPaymentOrder(orderId: number, paymentMethod: PaymentMethod): Promise<PaymentInitResponse> {
    const response = await api.post<PaymentInitResponse>('/payments', {
      orderId,
      paymentMethod,
    });
    return response.data;
  },

  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<PaymentVerifyResponse> {
    const response = await api.post<PaymentVerifyResponse>('/payments/verify', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    return response.data;
  },
};
