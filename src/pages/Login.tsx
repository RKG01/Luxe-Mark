import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Mail, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormInput = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInput) => {
    setIsSubmitting(true);
    try {
      const authRes = await login(data.email, data.password);
      
      const lowerEmail = data.email.toLowerCase();
      const isAdmin =
        lowerEmail === 'admin@example.com' ||
        lowerEmail.startsWith('admin') ||
        lowerEmail === 'ryuk@example.com' ||
        lowerEmail.startsWith('ryuk');

      toast.success(`Welcome back, ${authRes.username}!`, 'Login Successful');
      
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid email or password. Please try again.', 'Authentication Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full p-8 bg-white border border-slate-100 rounded-3xl shadow-xl flex flex-col gap-6">
        
        {/* Header Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-black text-xl tracking-tight text-slate-900 mx-auto">
            <span className="bg-indigo-600 text-white p-1.5 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <span>
              Luxe<span className="text-indigo-600">Mart</span>
            </span>
          </Link>
          <h2 className="text-xl font-black text-slate-800 tracking-tight mt-6">Welcome Back</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
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

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Password</label>
            </div>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footnote links */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
              Create an Account
            </Link>
          </p>
        </div>

        {/* Development Tip Box */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] text-slate-500">
          <span className="font-bold text-slate-700">Developer Testing TIP:</span> Use email <code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-700 font-mono">admin@example.com</code> or any email starting with <code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-700 font-mono">admin</code> to log in with the **ADMIN** role.
        </div>
      </div>
    </div>
  );
};
