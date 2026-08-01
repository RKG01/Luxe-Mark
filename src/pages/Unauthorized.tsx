import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-xl">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Access Restricted</h2>
        <p className="text-sm font-medium text-slate-500 mt-2">
          You do not have the required permissions to view this administration area. Please contact support or switch accounts if this is an error.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Homepage
          </Link>
          <Link
            to="/login"
            className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
          >
            Log in with Admin Account
          </Link>
        </div>
      </div>
    </div>
  );
};
