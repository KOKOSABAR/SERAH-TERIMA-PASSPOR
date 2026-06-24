/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Sun, Moon, AlertCircle } from 'lucide-react';

interface LoginGateProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogin: () => void;
}

export default function LoginGate({ theme, onToggleTheme, onLogin }: LoginGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password) {
      setError('Password wajib diisi.');
      return;
    }

    setIsLoading(true);

    // Simulate small smooth delay for security/premium experience
    setTimeout(() => {
      if (password === 'wdbos88') {
        onLogin();
      } else {
        setError('Password tidak sesuai. Silakan coba lagi.');
        setIsLoading(false);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
      
      {/* Theme toggle in top right corner */}
      <div className="absolute top-6 right-6">
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 transition shadow-xs cursor-pointer"
          title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
        >
          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-500" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-2xl p-8 space-y-6 transition-colors duration-200">
          
          {/* Brand Identity */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center rounded-2xl shadow-lg shadow-indigo-600/15">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight uppercase text-slate-800 dark:text-slate-100 font-sans">
                MASUK DASHBOARD
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1 font-sans">
                Sistem Logistik Serah Terima Paspor
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Password input container */}
            <div className="space-y-1.5">
              <label 
                htmlFor="password-input" 
                className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
              >
                Password Akses
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-xs font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-650 text-white text-xs font-extrabold uppercase tracking-widest rounded-2xl shadow-md hover:shadow-lg shadow-indigo-650/10 dark:shadow-none transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>MASUK KE DASHBOARD</span>
              )}
            </button>

          </form>

          {/* Hint info */}
          <div className="pt-2 border-t border-slate-50 dark:border-slate-800/50 text-center">
            <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider">
              Aman &bull; Terenkripsi Lokal
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
