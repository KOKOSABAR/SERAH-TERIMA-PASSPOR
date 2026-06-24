/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Calendar, Users, FileSpreadsheet, Download, Upload, Sun, Moon, LogOut, Cloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSheetWebAppUrl } from '../sheetConfig';

interface HeaderProps {
  activeTab: 'daily' | 'employees' | 'monthly';
  setActiveTab: (tab: 'daily' | 'employees' | 'monthly') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenSpreadsheet: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
  autoSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  autoSyncError: string | null;
}

export default function Header({
  activeTab,
  setActiveTab,
  selectedDate,
  setSelectedDate,
  onExport,
  onImport,
  onOpenSpreadsheet,
  theme,
  toggleTheme,
  onLogout,
  autoSyncStatus,
  autoSyncError,
}: HeaderProps) {
  const hasSheetUrl = Boolean(getSheetWebAppUrl());

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs flex-shrink-0 transition-colors duration-200" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-5 gap-4">
          
          {/* Brand/Logo */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center rounded-lg shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight uppercase text-slate-800 dark:text-slate-100 font-sans">
                DASHBORD SERAH TERIMA PASSPOR
              </h1>
            </div>
          </div>

          {/* Date Selector & Action Tools */}
          <div className="flex flex-wrap items-center gap-3">
            {activeTab !== 'employees' && (
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-colors">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm font-semibold focus:outline-none text-slate-700 dark:text-slate-200 font-sans cursor-pointer"
                  id="header-date-input"
                />
              </div>
            )}

            {/* Backup & Spreadsheet Operations */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenSpreadsheet}
                className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 transition cursor-pointer shadow-2xs"
                title="Integrasikan & Sinkronisasi ke Google Spreadsheet"
                id="btn-spreadsheet-integration"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="uppercase tracking-wider">Spreadsheet</span>
              </button>

              {hasSheetUrl && (
                <div className="flex items-center bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg py-1.5 px-3 space-x-2 shadow-2xs" id="sheets-sync-status-badge">
                  <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                    {autoSyncStatus === 'syncing' ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </>
                    ) : autoSyncStatus === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : autoSyncStatus === 'error' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider font-sans whitespace-nowrap">
                    {autoSyncStatus === 'syncing' && 'Menyimpan...'}
                    {autoSyncStatus === 'success' && 'Tersimpan otomatis!'}
                    {autoSyncStatus === 'error' && 'Gagal sinkron'}
                    {autoSyncStatus === 'idle' && 'Sheets Terhubung'}
                  </span>
                  {autoSyncStatus === 'error' && (
                    <div className="group relative">
                      <span className="text-[9px] text-rose-500 cursor-pointer font-extrabold underline decoration-dotted hover:text-rose-600 ml-0.5">
                        Detail
                      </span>
                      <div className="absolute top-full right-0 mt-2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded-lg p-2.5 w-64 shadow-2xl z-50 leading-relaxed font-semibold font-sans normal-case">
                        {autoSyncError}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={onExport}
                className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition shadow-2xs cursor-pointer"
                title="Unduh Cadangan Data (JSON)"
                id="btn-export-json"
              >
                <Download className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span className="hidden sm:inline uppercase tracking-wider">Ekspor</span>
              </button>
              
              <label
                className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-2xs"
                title="Unggah Cadangan Data (JSON)"
                id="label-import-json"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span className="hidden sm:inline uppercase tracking-wider">Impor</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImport}
                  className="hidden"
                />
              </label>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition shadow-2xs cursor-pointer"
                title={theme === 'light' ? 'Aktifkan Mode Gelap' : 'Aktifkan Mode Terang'}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-slate-500" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 p-2 rounded-lg border border-rose-200 dark:border-rose-900/40 transition shadow-2xs cursor-pointer"
                title="Keluar dari Dashboard"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-slate-100 dark:border-slate-800 -mb-px">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${
              activeTab === 'daily'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-slate-50/50 dark:bg-slate-800/30'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700'
            }`}
            id="tab-daily"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pencatatan Harian</span>
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${
              activeTab === 'monthly'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-slate-50/50 dark:bg-slate-800/30'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700'
            }`}
            id="tab-monthly"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Laporan Bulanan</span>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${
              activeTab === 'employees'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-slate-50/50 dark:bg-slate-800/30'
                : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700'
            }`}
            id="tab-employees"
          >
            <Users className="w-4 h-4" />
            <span>Master Karyawan</span>
          </button>
        </div>

      </div>
    </header>
  );
}
