import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, KeyRound, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(100),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

type RegisterFormInput = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInput) => {
    setIsSubmitting(true);
    try {
      await registerUser(data.username, data.email, data.password);
      toast.success('Your account has been created successfully! Welcome to LuxeMart.', 'Registration Successful');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during registration. Email or username might be in use.', 'Registration Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full p-8 bg-white border border-slate-100 rounded-3xl shadow-xl flex flex-col gap-6">
        
        {/* Logo and title */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-black text-xl tracking-tight text-slate-900 mx-auto">
            <span className="bg-indigo-600 text-white p-1.5 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <span>
              Luxe<span className="text-indigo-600">Mart</span>
            </span>
          </Link>
          <h2 className="text-xl font-black text-slate-800 tracking-tight mt-6">Create an Account</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Sign up to get started and manage your orders
          </p>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Username Field */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="john_doe"
                {...register('username')}
                className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                  errors.username ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.username && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="john@example.com"
                {...register('email')}
                className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                  errors.email ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm bg-slate-50 focus:bg-white focus:outline-none transition ${
                  errors.password ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle sign in */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
