import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, ShoppingCart, Check, RefreshCw, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ordersService } from '../services/orders';
import { useToast } from '../components/ui/Toast';
import { formatCurrency } from '../utils';
import { OrderStatus } from '../types';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  
  const orderId = Number(id);

  // Query
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersService.getOrderById(orderId),
    enabled: !isNaN(orderId),
  });

  // Mutation
  const cancelOrderMutation = useMutation({
    mutationFn: () => ordersService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Your order has been cancelled successfully.');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to cancel the order. It might already be delivered.');
    },
  });

  const handleCancelOrder = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate();
    }
  };

  const getStepStatus = (step: OrderStatus, current: OrderStatus) => {
    const sequence: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = sequence.indexOf(current);
    const stepIndex = sequence.indexOf(step);

    if (current === 'CANCELLED') {
      return 'cancelled';
    }
    if (stepIndex < currentIndex) {
      return 'completed';
    }
    if (stepIndex === currentIndex) {
      return 'active';
    }
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-amber-600 bg-amber-50';
      case 'CONFIRMED':
        return 'text-blue-600 bg-blue-50';
      case 'PROCESSING':
        return 'text-indigo-600 bg-indigo-50';
      case 'SHIPPED':
        return 'text-purple-600 bg-purple-50';
      case 'DELIVERED':
        return 'text-emerald-600 bg-emerald-50';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-500 bg-slate-50';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Retrieving order details...</p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm flex-grow">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="font-bold text-slate-700">Order Not Found</h3>
        <p className="text-sm text-slate-400 mt-1">
          The order you are trying to view could not be retrieved.
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const stepsList: { id: OrderStatus; label: string; desc: string }[] = [
    { id: 'PENDING', label: 'Placed', desc: 'Awaiting payment verification' },
    { id: 'CONFIRMED', label: 'Confirmed', desc: 'Payment verified successfully' },
    { id: 'PROCESSING', label: 'Processing', desc: 'Packing in warehouse' },
    { id: 'SHIPPED', label: 'Shipped', desc: 'Out for delivery' },
    { id: 'DELIVERED', label: 'Delivered', desc: 'Handed over to customer' },
  ];

  // Order can only be cancelled if it's PENDING, CONFIRMED, or PROCESSING
  const canCancel = ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      {/* Back button */}
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Main Order Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Status tracker & Items list */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stepper Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Order Status Tracker
            </h2>

            {order.status === 'CANCELLED' ? (
              <div className="flex gap-4 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-150">
                <XCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Order Cancelled</h4>
                  <p className="text-xs mt-0.5">This order has been cancelled and refunded (if payment was processed).</p>
                </div>
              </div>
            ) : (
              /* Vertical / Horizontal Stepper */
              <div className="relative pl-6 md:pl-0 flex flex-col md:flex-row justify-between gap-6 md:gap-4">
                {stepsList.map((step, idx) => {
                  const state = getStepStatus(step.id, order.status);
                  return (
                    <div key={step.id} className="relative flex md:flex-col md:items-center text-left md:text-center md:flex-1">
                      {/* Connection bar */}
                      {idx !== stepsList.length - 1 && (
                        <div
                          className={`absolute left-2.5 top-6 md:left-[55%] md:top-2.5 w-0.5 h-12 md:w-[90%] md:h-0.5 transition ${
                            state === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      )}

                      {/* Step Bubble Icon */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] z-10 ${
                          state === 'completed'
                            ? 'bg-emerald-500 text-white'
                            : state === 'active'
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {state === 'completed' ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>

                      {/* Text */}
                      <div className="ml-4 md:ml-0 md:mt-3">
                        <h4 className={`text-xs font-bold ${state === 'active' ? 'text-indigo-600' : 'text-slate-700'}`}>
                          {step.label}
                        </h4>
                        <p className="text-[10px] text-slate-450 mt-0.5 max-w-[120px] line-clamp-2 md:mx-auto">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Items Summary Table Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              Items In This Order
            </h2>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between py-4 text-sm">
                  <div>
                    <h4 className="font-bold text-slate-800">{item.productName}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      {formatCurrency(item.price)} each x {item.quantity} units
                    </p>
                  </div>
                  <span className="font-bold text-slate-800">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Invoice breakdown */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <h3 className="text-base font-bold text-slate-800 mb-6">Payment Invoice</h3>
            
            <div className="space-y-3 pb-6 border-b border-slate-100 text-xs text-slate-550 font-semibold">
              <div className="flex justify-between">
                <span>Order ID</span>
                <span className="text-slate-800">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Fees</span>
                <span className="text-emerald-500">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 text-sm font-bold text-slate-800">
              <span>Total Paid</span>
              <span className="text-base font-black text-indigo-600">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>

            {/* Cancel Action */}
            {canCancel && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelOrderMutation.isPending}
                className="mt-4 w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-red-200 transition cursor-pointer"
              >
                {cancelOrderMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
