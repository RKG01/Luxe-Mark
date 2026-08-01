import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Loader2, ArrowRight } from 'lucide-react';
import { productsService } from '../services/products';
import { categoriesService } from '../services/categories';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../utils';
import { ImagePlaceholder } from '../components/shared/ImagePlaceholder';
import { Skeleton } from '../components/ui/Skeleton';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Queries (only active if authenticated)
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getProducts,
    enabled: isAuthenticated,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
    enabled: isAuthenticated,
  });

  // Filtered and sorted products
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Filter active products
    result = result.filter((p) => p.active);

    // Apply Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Apply Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryName === selectedCategory);
    }

    // Apply Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  // Paginated Products
  const totalPages = Math.ceil(processedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return processedProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [processedProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (productId: number, productName: string) => {
    setAddingProductId(productId);
    try {
      await addToCart(productId, 1);
      toast.success(`${productName} added to your cart successfully!`);
    } catch (e) {
      toast.error(`Could not add ${productName} to cart. Out of stock or error.`);
    } finally {
      setAddingProductId(null);
    }
  };

  if (!isAuthenticated) {
    // Guest Landing Hero View
    return (
      <div className="flex-grow flex flex-col justify-center bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
        {/* Banner Section */}
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full mb-6">
            Welcome to LuxeMart
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none max-w-4xl">
            Where Premium Design Meets <span className="text-indigo-600">Pure Quality</span>.
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium mt-6 max-w-2xl">
            Explore our curated collections of premium footwear, lifestyle apparel, and state-of-the-art tech accessories. Sign in to view our exclusive catalog.
          </p>

          <div className="mt-10 flex gap-4">
            <Link
              to="/login"
              className="px-6 py-3.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-indigo-750 transition flex items-center gap-2 shadow-lg"
            >
              Sign In to Shop
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="px-6 py-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Register Now
            </Link>
          </div>

          {/* Grid Mock Preview */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl opacity-40 select-none pointer-events-none">
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col gap-3">
                <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-750 rounded" />
                <div className="w-1/2 h-4 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      {/* Search and Filters Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 rounded-3xl p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm bg-slate-50 dark:bg-slate-950 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Sort and Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Category selection */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-slate-200 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-350 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort Selection */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-slate-200 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-350 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
          </select>
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-4 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                selectedCategory === c.name
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Catalog Listing */}
      {isProductsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
            <div key={id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col gap-3 shadow-sm">
              <Skeleton className="w-full h-48 rounded-2xl" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : processedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 animate-fade-in">
            {paginatedProducts.map((p) => {
              const isOutOfStock = p.stock <= 0;
              return (
                <div
                  key={p.id}
                  className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-slate-200/80 dark:hover:border-slate-700/80 transition flex flex-col h-full"
                >
                  {/* Product Detail Router Link */}
                  <Link to={`/products/${p.id}`} className="block overflow-hidden rounded-2xl aspect-square mb-4">
                    <ImagePlaceholder
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 tracking-wider">
                        {p.categoryName}
                      </span>
                      <Link
                        to={`/products/${p.id}`}
                        className="block text-base font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition line-clamp-1 mt-0.5"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-slate-400 dark:text-slate-350 font-medium line-clamp-2 mt-1">
                        {p.description}
                      </p>
                    </div>

                    {/* Pricing and Cart Add */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {formatCurrency(p.price)}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[10px] text-red-500 font-bold">Out of stock</span>
                        ) : p.stock <= 5 ? (
                          <span className="text-[10px] text-amber-500 font-bold">Only {p.stock} left</span>
                        ) : (
                          <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold">{p.stock} in stock</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(p.id, p.name)}
                        disabled={isOutOfStock || addingProductId === p.id}
                        className={`p-3 rounded-2xl transition flex items-center justify-center cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-650 cursor-not-allowed'
                            : addingProductId === p.id
                            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                            : 'bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-705 shadow-sm'
                        }`}
                      >
                        {addingProductId === p.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition cursor-pointer"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 text-xs font-bold rounded-xl transition cursor-pointer ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-900 transition cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-12 text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
          <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">No products found</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, category filters, or check back later!
          </p>
        </div>
      )}
    </div>
  );
};
