import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag, MapPin, Trash2, Plus, Loader2, ClipboardList, CheckCircle2, ChevronRight, Home, Smartphone } from 'lucide-react';
import { ordersService } from '../services/orders';
import { addressesService } from '../services/addresses';
import { useToast } from '../components/ui/Toast';
import { formatCurrency, formatDate } from '../utils';

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(5, 'Postal code must be at least 5 digits'),
  isDefault: z.boolean().default(false),
});

type AddressFormInput = z.infer<typeof addressSchema>;

export const Profile: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'orders';

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Form for adding address
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormInput>({
    resolver: zodResolver(addressSchema) as any,
  });

  // Queries
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersService.getOrders,
  });

  const { data: addresses = [], isLoading: isAddressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesService.getAddresses,
  });

  // Mutations
  const createAddressMutation = useMutation({
    mutationFn: addressesService.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setIsAddressModalOpen(false);
      reset();
      toast.success('Address added successfully.');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to save address.');
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: addressesService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted successfully.');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to delete address.');
    },
  });

  const setTab = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  const handleCreateAddress = (data: AddressFormInput) => {
    createAddressMutation.mutate(data);
  };

  const handleDeleteAddress = (id: number) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteAddressMutation.mutate(id);
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      {/* Profile Header */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center">
          D
        </div>
        <div className="text-center md:text-left flex-grow">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Dashboard</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Manage your order history and default delivery addresses</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              currentTab === 'orders'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-505 hover:text-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            My Orders
          </button>
          <button
            onClick={() => setTab('addresses')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              currentTab === 'addresses'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-505 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Addresses
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {currentTab === 'orders' ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            Order History
          </h2>

          {isOrdersLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-4 px-4">Order ID</th>
                    <th className="py-4 px-4">Items Count</th>
                    <th className="py-4 px-4">Total Amount</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => {
                    const totalQty = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-4 font-bold text-slate-700 text-sm">
                          #{order.id}
                        </td>
                        <td className="py-4 px-4 text-xs font-medium text-slate-500">
                          {totalQty} {totalQty === 1 ? 'item' : 'items'}
                        </td>
                        <td className="py-4 px-4 text-sm font-black text-slate-800">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Link
                            to={`/orders/${order.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                          >
                            Details
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <ClipboardList className="w-10 h-10 text-slate-350 mx-auto mb-3" />
              <h3 className="font-bold text-slate-750">No orders found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                You haven't placed any orders yet. Visit our shop catalog to get started.
              </p>
              <Link
                to="/"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Address Book
            </h2>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>

          {isAddressesLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs text-slate-400 font-semibold">Loading address book...</p>
            </div>
          ) : addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between h-48 transition ${
                    addr.isDefault
                      ? 'border-indigo-600 bg-indigo-50/5/10 shadow-sm'
                      : 'border-slate-150 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-slate-400" />
                        {addr.fullName}
                      </p>
                      {addr.isDefault && (
                        <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-3 leading-relaxed">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                      <br />
                      {addr.city}, {addr.state} - {addr.postalCode}
                      <br />
                      {addr.country}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5" />
                      {addr.phoneNumber}
                    </span>
                    
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl">
              <MapPin className="w-10 h-10 text-slate-350 mx-auto mb-3" />
              <h3 className="font-bold text-slate-750">No addresses saved</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Save delivery addresses for faster and smoother checkout experiences.
              </p>
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Create First Address
              </button>
            </div>
          )}
        </div>
      )}

      {/* Address Form Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Address</h3>

            <form onSubmit={handleSubmit(handleCreateAddress)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="Rahul Kumar"
                  {...register('fullName')}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                    errors.fullName ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.fullName && <p className="text-[10px] text-red-500 font-bold">{errors.fullName.message}</p>}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  placeholder="9876543210"
                  {...register('phoneNumber')}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                    errors.phoneNumber ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.phoneNumber && <p className="text-[10px] text-red-500 font-bold">{errors.phoneNumber.message}</p>}
              </div>

              {/* Address Lines */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Address Line 1</label>
                <input
                  type="text"
                  placeholder="221B Baker Street"
                  {...register('addressLine1')}
                  className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                    errors.addressLine1 ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.addressLine1 && <p className="text-[10px] text-red-500 font-bold">{errors.addressLine1.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Near Metro Station"
                  {...register('addressLine2')}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    placeholder="Bengaluru"
                    {...register('city')}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                      errors.city ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.city && <p className="text-[10px] text-red-500 font-bold">{errors.city.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    placeholder="Karnataka"
                    {...register('state')}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                      errors.state ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.state && <p className="text-[10px] text-red-500 font-bold">{errors.state.message}</p>}
                </div>
              </div>

              {/* Country & Postal Code */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    placeholder="India"
                    {...register('country')}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                      errors.country ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.country && <p className="text-[10px] text-red-500 font-bold">{errors.country.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Postal Code</label>
                  <input
                    type="text"
                    placeholder="560001"
                    {...register('postalCode')}
                    className={`w-full px-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                      errors.postalCode ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.postalCode && <p className="text-[10px] text-red-500 font-bold">{errors.postalCode.message}</p>}
                </div>
              </div>

              {/* Set default checkbox */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isDefaultProfile"
                  {...register('isDefault')}
                  className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isDefaultProfile" className="text-xs font-semibold text-slate-650 cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-1/2 py-3 border border-slate-250 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAddressMutation.isPending}
                  className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {createAddressMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
