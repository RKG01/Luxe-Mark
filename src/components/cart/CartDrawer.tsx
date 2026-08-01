import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils';
import { ImagePlaceholder } from '../shared/ImagePlaceholder';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { cart, isDrawerOpen, setDrawerOpen, addToCart, removeFromCart, clearCart, isLoading } = useCart();

  const handleClose = () => setDrawerOpen(false);

  const handleQuantityIncrease = async (productId: number) => {
    try {
      await addToCart(productId, 1);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuantityDecrease = async (productId: number, currentQty: number) => {
    try {
      if (currentQty <= 1) {
        await removeFromCart(productId);
      } else {
        await addToCart(productId, -1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckoutClick = () => {
    setDrawerOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Shopping Cart</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-650 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items Area */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">
              {cart && cart.items.length > 0 ? (
                cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition"
                  >
                    {/* Item Image */}
                    <ImagePlaceholder
                      src="" // Dummy to trigger beautiful gradient
                      alt={item.productName}
                      className="w-16 h-16 rounded-lg flex-shrink-0"
                    />

                    {/* Item Details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {item.productName}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>

                      {/* Quantity Controls & Delete */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-950">
                          <button
                            onClick={() => handleQuantityDecrease(item.productId, item.quantity)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
                            disabled={isLoading}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-slate-700 dark:text-slate-250 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityIncrease(item.productId)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
                            disabled={isLoading}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition p-1"
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Price Subtotal */}
                    <div className="text-right flex flex-col justify-between flex-shrink-0">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-slate-350 dark:text-slate-650" />
                  </div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300">Your cart is empty</h4>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-[220px]">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {cart && cart.items.length > 0 && (
              <div className="p-5 border-t border-slate-100 dark:border-slate-850 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-550 dark:text-slate-400 font-medium">Subtotal</span>
                  <span className="text-base font-bold text-slate-850 dark:text-white">
                    {formatCurrency(cart.grandTotal)}
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => clearCart()}
                    className="w-1/3 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                    disabled={isLoading}
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleCheckoutClick}
                    className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-705 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm hover:shadow-md cursor-pointer"
                    disabled={isLoading}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
