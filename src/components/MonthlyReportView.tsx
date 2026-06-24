/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Employee, PassportLog } from '../types';
import { Calendar, Download, Eye, CheckCircle, Clock, AlertTriangle, X, Check, XCircle, Info, Shield, HelpCircle } from 'lucide-react';

interface MonthlyReportViewProps {
  employees: Employee[];
  logs: Record<string, PassportLog>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  setActiveTab: (tab: 'daily' | 'employees' | 'monthly') => void;
}

export default function MonthlyReportView({
  employees,
  logs,
  selectedDate,
  setSelectedDate,
  setActiveTab,
}: MonthlyReportViewProps) {
  // Parse year and month from selectedDate initially
  const initialDateObj = new Date(selectedDate);
  const [selectedYear, setSelectedYear] = useState(initialDateObj.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDateObj.getMonth()); // 0-indexed (0 = Jan, 5 = Jun)
  
  // State for the click-to-view detail modal
  const [selectedDetail, setSelectedDetail] = useState<{
    emp: Employee;
    day: number;
    dateStr: string;
    log?: PassportLog;
  } | null>(null);

  const MONTHS_INDONESIAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const DAYS_INDONESIAN_LONG = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];

  const YEARS = [2025, 2026, 2027, 2028];

  // Get number of days in the selected month & year
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysCount = getDaysInMonth(selectedYear, selectedMonth);
  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  // Helper to format date string
  const formatDateString = (day: number) => {
    const yyyy = selectedYear;
    const mm = String(selectedMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Get day name for columns (Indonesian abbreviated)
  const getDayLabel = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
    return date.toLocaleDateString('id-ID', options);
  };

  // Get full day label for modal
  const getFullDayLabel = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dayName = DAYS_INDONESIAN_LONG[date.getDay()];
    return `${dayName}, ${day} ${MONTHS_INDONESIAN[selectedMonth]} ${selectedYear}`;
  };

  // Check if a day is Sunday or Saturday
  const isWeekend = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  const activeEmployees = employees.filter(e => e.active);

  // Calculate statistics for each day of the selected month
  const getDayStats = (day: number) => {
    const dateStr = formatDateString(day);
    let totalActive = activeEmployees.length;
    let handedInMasuk = 0;
    let handedInPulang = 0;

    activeEmployees.forEach(emp => {
      const logId = `${dateStr}_${emp.id}`;
      const log = logs[logId];
      if (log?.masuk?.handed) handedInMasuk++;
      if (log?.pulang?.handed) handedInPulang++;
    });

    const completionRate = totalActive > 0 ? Math.round((handedInPulang / totalActive) * 100) : 0;
    const isPartial = handedInMasuk > 0 && handedInPulang < handedInMasuk;

    return {
      dateStr,
      handedInMasuk,
      handedInPulang,
      completionRate,
      isPartial,
      hasData: handedInMasuk > 0
    };
  };

  // Jump to specific day details
  const handleJumpToDay = (day: number) => {
    const dateStr = formatDateString(day);
    setSelectedDate(dateStr);
    setActiveTab('daily');
  };

  // Export Matrix to CSV
  const handleDownloadCSV = () => {
    const csvRows = [];
    
    // Header line
    const headers = ['Nama Karyawan', 'Nomor Paspor', 'Departemen'];
    daysArray.forEach(day => {
      headers.push(`Tgl ${day}`);
    });
    csvRows.push(headers.join(','));

    // Employee lines
    activeEmployees.forEach(emp => {
      const row = [
        `"${emp.name.replace(/"/g, '""')}"`,
        `"${emp.passportNumber}"`,
        `"${emp.department}"`
      ];

      daysArray.forEach(day => {
        const dateStr = formatDateString(day);
        const logId = `${dateStr}_${emp.id}`;
        const log = logs[logId];
        
        let status = 'Belum Ada';
        if (log?.masuk?.handed && log?.pulang?.handed) {
          status = 'LENGKAP';
        } else if (log?.masuk?.handed) {
          status = 'HANYA MASUK';
        }
        row.push(`"${status}"`);
      });

      csvRows.push(row.join(','));
    });

    // Create file and download
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Paspor_${MONTHS_INDONESIAN[selectedMonth]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="monthly-report-panel">
      
      {/* 1. Header & Selectors Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100/55 dark:border-indigo-900/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Laporan Rekapitulasi Bulanan</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Pilih bulan dan tahun untuk melihat matrix kehadiran paspor harian</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Month Select */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="py-1.5 px-3 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
              id="month-select"
            >
              {MONTHS_INDONESIAN.map((m, idx) => (
                <option key={m} value={idx} className="dark:bg-slate-900 dark:text-slate-200">{m}</option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="py-1.5 px-3 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
              id="year-select"
            >
              {YEARS.map(y => (
                <option key={y} value={y} className="dark:bg-slate-900 dark:text-slate-200">{y}</option>
              ))}
            </select>

            {/* CSV Download Button */}
            <button
              onClick={handleDownloadCSV}
              className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center space-x-1.5 cursor-pointer uppercase tracking-wider"
              id="btn-download-monthly-csv"
            >
              <Download className="w-4 h-4" />
              <span>Unduh CSV</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Visual Day Grid (Heatmap Calendar) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 transition-colors duration-200">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-5 flex items-center">
          <span>Peta Kehadiran Paspor Harian - {MONTHS_INDONESIAN[selectedMonth]} {selectedYear}</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-3" id="calendar-heatmap-grid">
          {daysArray.map(day => {
            const stats = getDayStats(day);
            const weekend = isWeekend(day);
            
            // Determine background color based on stats
            let bgClass = 'bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-950/40 dark:border-slate-800/80 dark:hover:bg-slate-800/40';
            let borderClass = 'border-dashed';
            let textClass = 'text-slate-700 dark:text-slate-300';
            let badgeText = '';

            if (stats.hasData) {
              borderClass = 'border-solid';
              if (stats.completionRate === 100) {
                bgClass = 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200 dark:bg-indigo-950/25 dark:hover:bg-indigo-900/30 dark:border-indigo-900/55';
                textClass = 'text-indigo-800 dark:text-indigo-300';
                badgeText = '100% SELESAI';
              } else if (stats.isPartial) {
                bgClass = 'bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/25 dark:hover:bg-amber-900/30 dark:border-amber-900/55';
                textClass = 'text-amber-800 dark:text-amber-300';
                badgeText = `${stats.handedInPulang}/${stats.handedInMasuk} PULANG`;
              } else {
                bgClass = 'bg-slate-100 hover:bg-slate-200 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700';
                textClass = 'text-slate-800 dark:text-slate-200';
                badgeText = `${stats.handedInMasuk} KARYAWAN`;
              }
            }

            return (
              <button
                key={day}
                onClick={() => handleJumpToDay(day)}
                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between h-20 group relative cursor-pointer ${bgClass} ${borderClass}`}
                id={`heatmap-day-${day}`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="font-extrabold text-sm font-mono text-slate-800 dark:text-slate-100">{day}</span>
                  <span className={`text-[8px] font-extrabold px-1 py-0.5 rounded-sm uppercase tracking-tight ${
                    weekend ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {getDayLabel(day)}
                  </span>
                </div>
                
                <div className="mt-2">
                  {stats.hasData ? (
                    <div className="flex flex-col">
                      <span className={`text-[8px] font-extrabold tracking-wider ${textClass}`}>
                        {badgeText}
                      </span>
                      {stats.completionRate < 100 && (
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mt-0.5">
                          SAFE: {stats.handedInMasuk - stats.handedInPulang}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 font-extrabold uppercase">Belum dicatat</span>
                  )}
                </div>

                {/* Hover Quick Action Indicator */}
                <span className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition duration-150">
                  <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Horizontal Matrix Table with 2 Status Indicators & Click to Dialog */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 overflow-hidden transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Matrix Kehadiran Karyawan Harian</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1 leading-relaxed">
              Klik salah satu sel tanggal karyawan untuk melihat detil jam &amp; petugas serah terima secara langsung.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>MASUK</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>PULANG</span>
            </div>
          </div>
        </div>

        {/* Outer scrolling container */}
        <div className="overflow-x-auto border border-slate-150 dark:border-slate-800 rounded-lg shadow-inner">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-4 py-3 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.03)] text-[10px] font-bold uppercase tracking-widest" style={{ minWidth: '160px' }}>
                  Nama Karyawan
                </th>
                <th scope="col" className="px-3 py-3 border-r border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest" style={{ minWidth: '95px' }}>
                  No. Paspor
                </th>
                {daysArray.map(day => (
                  <th key={day} scope="col" className={`px-2 py-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-0 ${isWeekend(day) ? 'bg-rose-50/55 dark:bg-rose-950/20 text-rose-600 dark:text-rose-300' : ''}`} style={{ minWidth: '60px' }}>
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-xs font-bold">{day}</span>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">{getDayLabel(day)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {activeEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                  
                  {/* Sticky Employee Name Column */}
                  <td className="px-4 py-3.5 sticky left-0 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-750 shadow-[2px_0_5px_rgba(0,0,0,0.03)] z-10">
                    {emp.name}
                  </td>

                  {/* Passport number column */}
                  <td className="px-3 py-3.5 border-r border-slate-200 dark:border-slate-750 font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    {emp.passportNumber}
                  </td>

                  {/* Dynamic Day Status Cells */}
                  {daysArray.map(day => {
                    const dateStr = formatDateString(day);
                    const logId = `${dateStr}_${emp.id}`;
                    const log = logs[logId];
                    const isMasuk = log?.masuk?.handed || false;
                    const isPulang = log?.pulang?.handed || false;

                    let cellBg = '';
                    if (isMasuk && isPulang) {
                      cellBg = 'bg-indigo-50/15 dark:bg-indigo-950/10';
                    } else if (isMasuk) {
                      cellBg = 'bg-amber-50/15 dark:bg-amber-950/10';
                    }

                    return (
                      <td 
                        key={day} 
                        onClick={() => setSelectedDetail({ emp, day, dateStr, log })}
                        className={`p-1 text-center border-r border-slate-200 dark:border-slate-750 last:border-0 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 transition ${cellBg}`}
                        id={`cell-${emp.id}-${day}`}
                      >
                        <div className="flex items-center justify-center space-x-1.5 min-w-[50px] py-1">
                          
                          {/* Indicator 1: SERAH TERIMA MASUK */}
                          <div 
                            className="transition-transform duration-100 hover:scale-115"
                            title={isMasuk ? `SERAH TERIMA MASUK - Jam: ${log?.masuk?.time} oleh ${log?.masuk?.pic}` : 'Belum Serah Terima Masuk'}
                          >
                            {isMasuk ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex items-center justify-center shrink-0">
                                <span className="text-[7px] text-slate-300 dark:text-slate-600 font-black">M</span>
                              </div>
                            )}
                          </div>

                          {/* Indicator 2: SERAH TERIMA PULANG */}
                          <div 
                            className="transition-transform duration-100 hover:scale-115"
                            title={isPulang ? `SERAH TERIMA PULANG - Jam: ${log?.pulang?.time} oleh ${log?.pulang?.pic}` : 'Belum Serah Terima Pulang'}
                          >
                            {isPulang ? (
                              <CheckCircle className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 flex items-center justify-center shrink-0">
                                <span className="text-[7px] text-slate-300 dark:text-slate-600 font-black">P</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Beautiful Micro Details Modal (Jam Berapa Melakukan Serah Terima) */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="matrix-details-modal-overlay">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-slideUp transition-colors duration-200"
            id="matrix-details-modal"
          >
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-2.5">
                <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-extrabold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Detail Serah Terima Paspor</span>
              </div>
              <button 
                onClick={() => setSelectedDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-150 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Tutup dialog"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-6">
              
              {/* Employee & Date Card */}
              <div className="bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-150 dark:border-slate-800/80">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Karyawan &amp; Tanggal</p>
                <h5 className="font-extrabold text-slate-800 dark:text-slate-100 text-base mt-1">{selectedDetail.emp.name}</h5>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Paspor: {selectedDetail.emp.passportNumber}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40">
                    {selectedDetail.emp.department}
                  </span>
                </div>
                <div className="mt-3.5 pt-3.5 border-t border-slate-150 dark:border-slate-800/80 flex items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
                  <span>{getFullDayLabel(selectedDetail.day)}</span>
                </div>
              </div>

              {/* Serah Terima Details */}
              <div className="space-y-4">
                
                {/* 1. SERAH TERIMA MASUK Status */}
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {selectedDetail.log?.masuk?.handed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-700 shrink-0" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">SERAH TERIMA MASUK</p>
                    {selectedDetail.log?.masuk?.handed ? (
                      <div className="mt-1 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3 rounded-xl space-y-1">
                        <div className="flex justify-between text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          <span>Jam Serah Terima:</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100/45 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">{selectedDetail.log.masuk.time}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Petugas Jaga (PIC):</span>
                          <span className="font-bold">{selectedDetail.log.masuk.pic || '-'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-500 font-semibold italic mt-0.5">Belum melakukan serah terima paspor masuk pada hari ini.</p>
                    )}
                  </div>
                </div>

                {/* 2. SERAH TERIMA PULANG Status */}
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {selectedDetail.log?.pulang?.handed ? (
                      <CheckCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-700 shrink-0" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">SERAH TERIMA PULANG</p>
                    {selectedDetail.log?.pulang?.handed ? (
                      <div className="mt-1 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-3 rounded-xl space-y-1">
                        <div className="flex justify-between text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          <span>Jam Pengembalian:</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-100/45 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">{selectedDetail.log.pulang.time}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                          <span>Petugas Jaga (PIC):</span>
                          <span className="font-bold">{selectedDetail.log.pulang.pic || '-'}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-500 font-semibold italic mt-0.5">
                        {selectedDetail.log?.masuk?.handed 
                          ? 'Paspor masih berada di dalam Safe (Sedang Kerja).' 
                          : 'Belum bisa pulang sebelum diserahkan masuk.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes log */}
                {selectedDetail.log?.notes && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Catatan / Keterangan</p>
                    <div className="mt-1 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {selectedDetail.log.notes}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Footer buttons */}
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedDate(selectedDetail.dateStr);
                  setActiveTab('daily');
                  setSelectedDetail(null);
                }}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                Atur Log Hari Ini
              </button>
              <button
                onClick={() => setSelectedDetail(null)}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
