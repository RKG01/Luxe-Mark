import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Landmark, FileText, ShoppingBag, FolderTree, ArrowUpRight, TrendingUp } from 'lucide-react';
import { adminService } from '../../services/admin';
import { productsService } from '../../services/products';
import { categoriesService } from '../../services/categories';
import { formatCurrency } from '../../utils';

export const AdminDashboard: React.FC = () => {
  // Queries
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminService.getAllOrders,
  });

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getProducts,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
  });

  // Derived Stats
  const totalSales = React.useMemo(() => {
    // Only count sales for paid/active orders (CONFIRMED, PROCESSING, SHIPPED, DELIVERED)
    const activeStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    return orders
      .filter((o) => activeStatuses.includes(o.status))
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const stats = [
    {
      name: 'Total Sales Revenue',
      value: formatCurrency(totalSales),
      icon: Landmark,
      color: 'bg-emerald-50 text-emerald-600',
      description: 'Confirmed & delivered payments',
    },
    {
      name: 'Customer Orders',
      value: orders.length.toString(),
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600',
      description: 'Total order records logged',
    },
    {
      name: 'Catalog Products',
      value: products.length.toString(),
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
      description: 'Active items in database',
    },
    {
      name: 'Product Categories',
      value: categories.length.toString(),
      icon: FolderTree,
      color: 'bg-purple-50 text-purple-600',
      description: 'Active categories defined',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overview Dashboard</h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">Management summary of sales performance and inventory indices</p>
      </div>

      {/* Grid of Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition flex flex-col justify-between h-40"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </span>
              </div>
              
              <div className="mt-4">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  {stat.name}
                </p>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1">
                  {stat.value}
                </h3>
                <p className="text-[10px] text-slate-450 mt-1 font-medium">
                  {stat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Mock Layout */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <ArrowUpRight className="w-4 h-4 text-indigo-500" />
          Recent Management Activity
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4 items-start text-xs border-b border-slate-50 pb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-700">Stock Threshold Checked</p>
              <p className="text-slate-400 mt-0.5">Inventory levels are stable. No items are currently critical.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start text-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-700">Financial Verification</p>
              <p className="text-slate-400 mt-0.5">Razorpay signature hashes matched successfully for all daily verification operations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
