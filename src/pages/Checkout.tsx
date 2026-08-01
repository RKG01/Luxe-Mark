import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Check, ChevronRight, CreditCard, Wallet, Landmark, QrCode, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { useRazorpay } from '../hooks/useRazorpay';
import { addressesService } from '../services/addresses';
import { ordersService } from '../services/orders';
import { paymentsService } from '../services/payments';
import { formatCurrency } from '../utils';
import { Address, PaymentMethod } from '../types';

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

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const { openCheckout } = useRazorpay();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Form for new address
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormInput>({
    resolver: zodResolver(addressSchema) as any,
  });

  // Queries
  const { data: addresses = [], isLoading: isAddressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressesService.getAddresses,
    select: (data) => {
      // Set default address selected by default if available
      if (data.length > 0 && selectedAddressId === null) {
        const def = data.find((a) => a.isDefault);
        setSelectedAddressId(def ? def.id : data[0].id);
      }
      return data;
    },
  });

  // Mutations
  const createAddressMutation = useMutation({
    mutationFn: addressesService.createAddress,
    onSuccess: (newAddress) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setSelectedAddressId(newAddress.id);
      setIsAddressModalOpen(false);
      reset();
      toast.success('Shipping address added successfully.');
    },
    onError: (e: any) => {
      toast.error(e.message || 'Could not save address.');
    },
  });

  const handleCreateAddress = (data: AddressFormInput) => {
    createAddressMutation.mutate(data);
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.warning('Please select or add a shipping address.');
      return;
    }
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    setIsProcessingOrder(true);
    let createdOrder: any = null;

    try {
      // 1. Create order
      toast.info('Creating order...', 'Checkout Step 1/3');
      createdOrder = await ordersService.checkout(selectedAddressId);

      // 2. Initialize Payment on backend
      toast.info('Initializing gateway payment order...', 'Checkout Step 2/3');
      const paymentInit = await paymentsService.createPaymentOrder(createdOrder.id, selectedMethod);

      // 3. Trigger Razorpay Overlay Checkout
      toast.info('Opening payment gateway modal...', 'Checkout Step 3/3');
      
      const rzpOptions = {
        key: paymentInit.key,
        amount: Math.round(paymentInit.amount * 100), // convert to paise
        currency: paymentInit.currency,
        name: 'LuxeMart',
        description: `Payment for Order #${createdOrder.id}`,
        order_id: paymentInit.gatewayOrderId,
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
          contact: addresses.find(a => a.id === selectedAddressId)?.phoneNumber || '',
        },
        handler: async (response: any) => {
          // Verification Handler
          setIsProcessingOrder(true);
          try {
            toast.info('Verifying signature with bank...', 'Finishing checkout');
            await paymentsService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            
            // On Success: Clear cart & redirect
            toast.success('Your payment has been verified. Order placed successfully!', 'Payment Verified');
            await clearCart();
            await fetchCart();
            navigate('/profile');
          } catch (e: any) {
            toast.error(e.message || 'Signature verification failed. Please contact support.', 'Payment Error');
            navigate('/profile');
          } finally {
            setIsProcessingOrder(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.warning('Payment popup was closed. Your order remains PENDING.', 'Checkout Dismissed');
            navigate('/profile');
          },
        },
      };

      await openCheckout(rzpOptions);

    } catch (e: any) {
      toast.error(e.message || 'Checkout failed. Please check your card credentials or stock availability.', 'Checkout Error');
      setIsProcessingOrder(false);
    }
  };

  const paymentMethodsList = [
    { id: 'UPI' as PaymentMethod, name: 'UPI / QR', icon: QrCode },
    { id: 'CARD' as PaymentMethod, name: 'Credit / Debit Card', icon: CreditCard },
    { id: 'NET_BANKING' as PaymentMethod, name: 'Net Banking', icon: Landmark },
    { id: 'WALLET' as PaymentMethod, name: 'Mobile Wallet', icon: Wallet },
  ];

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm flex-grow">
        <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-bold text-slate-700">Checkout is Unavailable</h3>
        <p className="text-sm text-slate-400 mt-1">
          Your cart is currently empty. Add products before proceeding.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
        >
          Go back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Address and Payment */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Shipping Address */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black flex items-center justify-center">1</span>
                Shipping Address
              </h2>
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            </div>

            {isAddressesLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                      selectedAddressId === addr.id
                        ? 'border-indigo-600 bg-indigo-50/10 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm text-slate-800">{addr.fullName}</p>
                      {selectedAddressId === addr.id && (
                        <span className="bg-indigo-600 text-white p-0.5 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-medium">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <p className="text-xs text-slate-400 font-bold mt-2">{addr.phoneNumber}</p>
                    {addr.isDefault && (
                      <span className="absolute bottom-4 right-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-sm text-slate-400">No saved addresses found.</p>
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  Create New Address
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black flex items-center justify-center">2</span>
              Payment Method
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {paymentMethodsList.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600 shadow-sm'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-[11px] font-bold tracking-tight">{method.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <h2 className="text-base font-bold text-slate-800 mb-4">Order Summary</h2>

            {/* Items Summary list */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto mb-6 pr-1">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between py-3 text-xs">
                  <div className="max-w-[70%]">
                    <p className="font-semibold text-slate-700 line-clamp-1">{item.productName}</p>
                    <p className="text-slate-400 mt-0.5">Qty: {item.quantity} x {formatCurrency(item.price)}</p>
                  </div>
                  <span className="font-bold text-slate-800 flex-shrink-0">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Details */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Shipping Fees</span>
                <span className="text-emerald-500 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-100">
                <span>Grand Total</span>
                <span>{formatCurrency(cart.grandTotal)}</span>
              </div>
            </div>

            {/* Action Checkout Trigger */}
            <button
              onClick={handleCheckout}
              disabled={isProcessingOrder || isAddressesLoading}
              className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] cursor-pointer"
            >
              {isProcessingOrder ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {formatCurrency(cart.grandTotal)}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Shipping Address</h3>

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
                  id="isDefault"
                  {...register('isDefault')}
                  className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isDefault" className="text-xs font-semibold text-slate-650 cursor-pointer">
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
