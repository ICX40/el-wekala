import React from 'react';
import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        
        {/* Logo / Brand Name Container */}
        <div className="relative flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-lg border border-slate-100">
          {/* Spinning Loader */}
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
        
        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-3xl font-extrabold text-blue-600 tracking-wider">
            الوكالة
          </h2>
          <div className="flex items-center gap-1 text-slate-500 font-medium text-sm">
            <span>Loading</span>
            <span className="animate-bounce delay-75">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </div>
        </div>

      </div>
    </div>
  );
}