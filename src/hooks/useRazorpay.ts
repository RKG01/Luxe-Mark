import { useState } from 'react';

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  order_id: string; // gatewayOrderId from backend
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        setIsLoaded(true);
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setIsLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const openCheckout = async (
    options: Omit<RazorpayOptions, 'theme'> & { themeColor?: string }
  ) => {
    const loaded = await loadScript();
    if (!loaded) {
      throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
    }

    const checkoutOptions: RazorpayOptions = {
      ...options,
      theme: {
        color: options.themeColor || '#6366f1', // Indigo accent
      },
    };

    const rzp = new window.Razorpay(checkoutOptions);
    rzp.open();
  };

  return { openCheckout, isLoaded };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}
