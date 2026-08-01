import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} LuxeMart Inc. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-xs text-slate-400 hover:text-slate-600 transition">Privacy Policy</a>
          <a href="#" className="text-xs text-slate-400 hover:text-slate-600 transition">Terms of Service</a>
          <a href="#" className="text-xs text-slate-400 hover:text-slate-600 transition">Contact Support</a>
        </div>
      </div>
    </footer>
  );
};
