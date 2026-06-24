/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyStats } from '../types';
import { Users, LogIn, LogOut, Briefcase, CheckCircle, ShieldAlert } from 'lucide-react';

interface StatsCardsProps {
  stats: DailyStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const completionRate = stats.totalEmployees > 0 
    ? Math.round((stats.handedInPulang / stats.totalEmployees) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-fadeIn" id="stats-dashboard-grid">
      
      {/* Total Karyawan */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-4 transition-colors duration-205" id="stat-card-total">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-100 dark:border-slate-750">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Karyawan</p>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{stats.totalEmployees}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Karyawan Aktif</p>
        </div>
      </div>

      {/* Serah Masuk (Masuk Kerja) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-4 transition-colors duration-205" id="stat-card-masuk">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100/55 dark:border-emerald-900/30">
          <LogIn className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">SERAH TERIMA MASUK</p>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {stats.handedInMasuk}
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">/{stats.totalEmployees}</span>
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Diterima Safe</p>
        </div>
      </div>

      {/* Ambil Pulang (Pulang Kerja) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-4 transition-colors duration-205" id="stat-card-pulang">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/35 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-100/55 dark:border-blue-900/30">
          <LogOut className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">SERAH TERIMA PULANG</p>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {stats.handedInPulang}
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">/{stats.totalEmployees}</span>
          </p>
          <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Dikembalikan</p>
        </div>
      </div>

      {/* Paspor di Safe/Lemari */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center space-x-4 transition-colors duration-205" id="stat-card-held">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/35 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-100/55 dark:border-amber-900/30">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Paspor di Safe</p>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">{stats.currentlyHeld}</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Sedang Disimpan</p>
        </div>
      </div>

      {/* Status Hari Ini - High Contrast Indigo Block */}
      <div className="bg-indigo-600 dark:bg-indigo-700 p-4 rounded-xl shadow-xs flex items-center justify-between col-span-2 lg:col-span-1 text-white transition-colors duration-205" id="stat-card-completion">
        <div>
          <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-1">Status Operasional</p>
          <p className="text-sm font-extrabold leading-tight uppercase tracking-wider">
            {completionRate === 100 ? 'SELESAI 100%' : 'BERJALAN AKTIF'}
          </p>
          <div className="flex items-center space-x-2 mt-1.5">
            <span className="text-[10px] font-mono font-bold bg-indigo-700 dark:bg-indigo-800 text-indigo-100 px-1.5 py-0.5 rounded">
              {completionRate}% Selesai
            </span>
          </div>
        </div>
        <div className="p-2 bg-indigo-500 dark:bg-indigo-600 rounded-lg">
          <CheckCircle className="w-5 h-5 text-indigo-100" />
        </div>
      </div>

    </div>
  );
}

