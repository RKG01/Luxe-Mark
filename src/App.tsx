import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { CartDrawer } from './components/cart/CartDrawer';

// Pages
import { Home } from './pages/Home';
import { ProductDetails } from './pages/ProductDetails';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Checkout } from './pages/Checkout';
import { Profile } from './pages/Profile';
import { OrderDetails } from './pages/OrderDetails';
import { Unauthorized } from './pages/Unauthorized';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';

// Create TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Layout for customer-facing pages
const CustomerLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

// Layout for admin administration pages
const AdminLayout: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Reuse the navbar for user logout/profile controls */}
        <Navbar />
        <div className="flex flex-grow">
          <AdminSidebar />
          <main className="flex-grow p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Customer Routes */}
                <Route element={<CustomerLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* Protected Customer Routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
                        <OrderDetails />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Admin Routes */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                </Route>

                {/* Fallback Catch */}
                <Route path="*" element={<Home />} />
              </Routes>
            </BrowserRouter>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
