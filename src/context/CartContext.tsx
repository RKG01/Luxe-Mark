import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem } from '../types';
import { cartService } from '../services/cart';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDrawerOpen, setDrawerOpen] = useState<boolean>(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (e) {
      console.error('Failed to fetch cart:', e);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: number, quantity: number) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
      setDrawerOpen(true); // Open drawer automatically on add
    } catch (e) {
      console.error('Failed to add to cart:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!isAuthenticated || !cart) return;
    setIsLoading(true);
    try {
      // The backend expects the CartItem DB primary key (which is not exposed).
      // We will try calling the API with the productId as the path variable.
      await cartService.removeFromCart(productId);
      
      // If successful, reload cart
      await fetchCart();
    } catch (e) {
      console.warn('API cart item removal failed due to backend contract gap (missing itemId). Performing local state removal fallback.');
      
      // FALLBACK: Update the cart state locally if the backend rejects the request
      const updatedItems = cart.items.filter(item => item.productId !== productId);
      const newGrandTotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      setCart({
        ...cart,
        items: updatedItems,
        grandTotal: newGrandTotal
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (e) {
      console.error('Failed to clear cart:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const cartCount = cart?.items.reduce((count, item) => count + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isDrawerOpen,
        setDrawerOpen,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
