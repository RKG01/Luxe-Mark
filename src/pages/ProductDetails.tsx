import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingCart, Plus, Minus, Check, HelpCircle, Loader2 } from 'lucide-react';
import { productsService } from '../services/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../utils';
import { ImagePlaceholder } from '../components/shared/ImagePlaceholder';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const productId = Number(id);

  // Fetch product detail
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productsService.getProductById(productId),
    enabled: !isNaN(productId),
  });

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (!product) return;
    if (type === 'inc') {
      if (quantity < product.stock) {
        setQuantity(quantity + 1);
      } else {
        toast.warning(`Cannot select more than ${product.stock} items (maximum stock reached).`);
      }
    } else {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!product || isAdding) return;
    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      toast.success(`${quantity} x ${product.name} added to your cart!`);
    } catch (e) {
      toast.error('Failed to add product to cart. Out of stock or error.');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Retrieving product details...</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex-grow">
        <HelpCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="font-bold text-slate-700 dark:text-slate-300">Product Not Found</h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          The product you are looking for does not exist or has been deactivated.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Col: Product Image */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-center aspect-square overflow-hidden">
          <ImagePlaceholder
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full rounded-2xl object-cover"
          />
        </div>

        {/* Right Col: Product Info */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full">
                {product.categoryName}
              </span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-4">
                {product.name}
              </h1>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatCurrency(product.price)}
              </p>
            </div>

            <div className="border-t border-b border-slate-100 dark:border-slate-800 py-6">
              <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-300 font-medium leading-relaxed">
                {product.description || 'No description available for this premium item.'}
              </p>
            </div>

            {/* Stock Level Warning */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                Availability:
              </span>
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 rounded">
                  Out of Stock
                </span>
              ) : product.stock <= 5 ? (
                <span className="text-xs font-bold text-amber-650 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-0.5 rounded animate-pulse">
                  Only {product.stock} items left!
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-650 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded">
                  In Stock ({product.stock} units available)
                </span>
              )}
            </div>
          </div>

          {/* Action Row: Quantity select and Add */}
          {!isOutOfStock && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  Quantity
                </span>
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                  <button
                    onClick={() => handleQuantityChange('dec')}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                    disabled={quantity <= 1 || isAdding}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 text-sm font-bold text-slate-700 dark:text-slate-205 min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange('inc')}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                    disabled={quantity >= product.stock || isAdding}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-grow py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] cursor-pointer"
                >
                  {isAdding ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add {quantity} to Cart — {formatCurrency(product.price * quantity)}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
