import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, ClipboardList, RefreshCw, ChevronDown, Check } from 'lucide-react';
import { adminService } from '../../services/admin';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency } from '../../utils';
import { Order, OrderStatus } from '../../types';

export const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Query
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminService.getAllOrders,
  });

  // Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      adminService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated successfully.');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to update order status.');
    },
    onSettled: () => {
      setUpdatingOrderId(null);
    },
  });

  const handleStatusChange = (orderId: number, nextStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    updateStatusMutation.mutate({ id: orderId, status: nextStatus });
  };

  // Helper to filter allowed transitions based on current status
  const getNextAllowedStatuses = (current: OrderStatus): OrderStatus[] => {
    switch (current) {
      case 'PENDING':
        return ['CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED':
        return ['PROCESSING', 'CANCELLED'];
      case 'PROCESSING':
        return ['SHIPPED'];
      case 'SHIPPED':
        return ['DELIVERED'];
      case 'DELIVERED':
      case 'CANCELLED':
      default:
        return []; // No further transitions allowed
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'CONFIRMED':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'PROCESSING':
        return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'SHIPPED':
        return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'DELIVERED':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-100';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Orders</h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">Review customer transactions and update order delivery stages</p>
      </div>

      {/* Orders table */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        {isOrdersLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-4 px-4">Order ID</th>
                  <th className="py-4 px-4">Items Summary</th>
                  <th className="py-4 px-4">Total Amount</th>
                  <th className="py-4 px-4">Current Status</th>
                  <th className="py-4 px-4">Transition Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => {
                  const allowedOptions = getNextAllowedStatuses(order.status);
                  const isUpdating = updatingOrderId === order.id;
                  
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 font-bold text-slate-700 text-sm">
                        #{order.id}
                      </td>
                      <td className="py-4 px-4 max-w-xs text-xs font-medium text-slate-500">
                        <div className="line-clamp-2">
                          {order.items?.map((item) => `${item.productName} (x${item.quantity})`).join(', ') || 'No items'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm font-black text-slate-800">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block border px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {isUpdating ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Updating...
                          </div>
                        ) : allowedOptions.length > 0 ? (
                          <div className="relative inline-block text-left">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-655 focus:outline-none cursor-pointer transition"
                            >
                              <option value={order.status} disabled>
                                Advance Stage
                              </option>
                              {allowedOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-slate-400" />
                            Final Stage
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
            <FileText className="w-10 h-10 text-slate-350 mx-auto mb-3" />
            <h3 className="font-bold text-slate-750">No orders logged</h3>
            <p className="text-xs text-slate-450 mt-1">Customer order lists will be logged here once transactions occur.</p>
          </div>
        )}
      </div>
    </div>
  );
};
