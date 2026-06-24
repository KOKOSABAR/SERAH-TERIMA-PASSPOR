/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Employee, PassportLog, HandoverDetails } from '../types';
import { 
  Search, 
  Filter, 
  LogIn, 
  LogOut, 
  Undo2, 
  Edit3, 
  CheckCircle, 
  X, 
  Check, 
  User, 
  NotebookTabs,
  HelpCircle,
  FileCheck
} from 'lucide-react';

export const OFFICER_LIST = [
  'FADLAN PRATAMA',
  'NICO FEBRIAN',
  'NICO ADRIANSYAH HUTAGAOL',
  'ERIC SYAHPUTRA',
  'HENGKI',
  'ARJUN'
];

interface DailyHandoverTableProps {
  employees: Employee[];
  logs: Record<string, PassportLog>;
  selectedDate: string;
  defaultPic: string;
  setDefaultPic: (pic: string) => void;
  onUpdateLog: (
    employeeId: string, 
    type: 'masuk' | 'pulang', 
    details: { handed: boolean; time?: string; pic?: string }
  ) => void;
  onUpdateNotes: (employeeId: string, notes: string) => void;
}

export default function DailyHandoverTable({
  employees,
  logs,
  selectedDate,
  defaultPic,
  setDefaultPic,
  onUpdateLog,
  onUpdateNotes,
}: DailyHandoverTableProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'belum-masuk' | 'sedang-kerja' | 'selesai'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  
  // Inline editing state
  const [editingCell, setEditingCell] = useState<{
    employeeId: string;
    type: 'masuk' | 'pulang';
  } | null>(null);
  
  const [editTime, setEditTime] = useState('');
  const [editPic, setEditPic] = useState('');

  // Extract departments for filter dropdown
  const departments = Array.from(new Set(employees.map(e => e.department))).filter(Boolean);

  // Helper to get log for a specific employee and selected date
  const getLogForEmployee = (employeeId: string): PassportLog | undefined => {
    const logId = `${selectedDate}_${employeeId}`;
    return logs[logId];
  };

  // Quick action: Fast handover toggle
  const handleQuickToggle = (employeeId: string, type: 'masuk' | 'pulang') => {
    const log = getLogForEmployee(employeeId);
    const details = log ? log[type] : { handed: false, time: '', pic: '' };
    
    if (details.handed) {
      // If already handed, undo it
      onUpdateLog(employeeId, type, { handed: false });
    } else {
      // Check if PIC is specified
      const officerPic = defaultPic.trim() || 'Petugas Jaga';
      
      // Get current local time formatted as HH:MM
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;

      onUpdateLog(employeeId, type, {
        handed: true,
        time: timeStr,
        pic: officerPic,
      });
    }
  };

  // Start inline editing
  const startEditing = (employeeId: string, type: 'masuk' | 'pulang', details: HandoverDetails) => {
    setEditingCell({ employeeId, type });
    setEditTime(details.time || '');
    setEditPic(details.pic || defaultPic || 'Petugas Jaga');
  };

  // Save inline editing
  const saveEditing = (employeeId: string, type: 'masuk' | 'pulang') => {
    if (!editTime.trim()) {
      alert('Jam serah terima tidak boleh kosong.');
      return;
    }
    onUpdateLog(employeeId, type, {
      handed: true,
      time: editTime,
      pic: editPic.trim() || 'Petugas Jaga'
    });
    setEditingCell(null);
  };

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    if (!emp.active) return false;
    
    // Search
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      emp.passportNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Department
    const matchesDept = deptFilter === 'all' || emp.department === deptFilter;

    // Status
    const log = getLogForEmployee(emp.id);
    const isMasuk = log?.masuk?.handed || false;
    const isPulang = log?.pulang?.handed || false;

    let matchesStatus = true;
    if (statusFilter === 'belum-masuk') {
      matchesStatus = !isMasuk;
    } else if (statusFilter === 'sedang-kerja') {
      matchesStatus = isMasuk && !isPulang;
    } else if (statusFilter === 'selesai') {
      matchesStatus = isMasuk && isPulang;
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm" id="daily-logbook-container">
      
      {/* Table Filters & Default PIC Configuration */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-t-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Quick Config: Active Officer */}
          <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg shadow-2xs max-w-sm">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div className="w-full">
              <label className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-widest">
                PETUGAS
              </label>
              <select
                value={defaultPic}
                onChange={(e) => setDefaultPic(e.target.value)}
                className="text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none w-full bg-transparent border-0 p-0 focus:ring-0 cursor-pointer font-sans"
                id="default-pic-select"
              >
                {OFFICER_LIST.map((officer) => (
                  <option key={officer} value={officer} className="dark:bg-slate-900 dark:text-slate-100">
                    {officer}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Helper Badge */}
          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-500 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <HelpCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="font-medium text-slate-500 dark:text-slate-400">Klik tombol untuk serah terima instan. Klik jam untuk edit manual.</span>
          </div>

        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          {/* Search bar */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari Nama Karyawan atau Nomor Paspor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs font-medium border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100"
              id="search-employee-input"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-2 px-3 w-full text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
              id="status-filter-select"
            >
              <option value="all" className="dark:bg-slate-900 dark:text-slate-100">Semua Status Harian</option>
              <option value="belum-masuk" className="dark:bg-slate-900 dark:text-slate-100">Belum Setor Paspor (Masuk)</option>
              <option value="sedang-kerja" className="dark:bg-slate-900 dark:text-slate-100">Sedang Kerja (Paspor di Safe)</option>
              <option value="selesai" className="dark:bg-slate-900 dark:text-slate-100">Selesai (Sudah Ambil Paspor)</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="py-2 px-3 w-full text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 cursor-pointer"
              id="dept-filter-select"
            >
              <option value="all" className="dark:bg-slate-900 dark:text-slate-100">Semua Departemen</option>
              {departments.map(dept => (
                <option key={dept} value={dept} className="dark:bg-slate-900 dark:text-slate-100">{dept}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800" id="daily-handover-table">
          <thead className="bg-slate-50 dark:bg-slate-800/40">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Karyawan & No. Paspor
              </th>
              <th scope="col" className="px-6 py-3.5 text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border-l border-slate-100 dark:border-slate-800">
                SERAH TERIMA MASUK
              </th>
              <th scope="col" className="px-6 py-3.5 text-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border-l border-slate-100 dark:border-slate-800">
                SERAH TERIMA PULANG
              </th>
              <th scope="col" className="px-6 py-3.5 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-l border-slate-100 dark:border-slate-800">
                Catatan / Keterangan
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                  <NotebookTabs className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  Tidak ada data karyawan yang cocok dengan kriteria filter.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const log = getLogForEmployee(emp.id);
                const isMasuk = log?.masuk?.handed || false;
                const isPulang = log?.pulang?.handed || false;
                
                const masukDetails: HandoverDetails = log?.masuk || { handed: false, time: '', pic: '' };
                const pulangDetails: HandoverDetails = log?.pulang || { handed: false, time: '', pic: '' };

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0" id={`row-emp-${emp.id}`}>
                    
                    {/* Employee Profile */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{emp.name}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/80">
                            {emp.passportNumber}
                          </span>
                          <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{emp.department}</span>
                        </div>
                      </div>
                    </td>

                    {/* 1. SERAH MASUK */}
                    <td className="px-6 py-4 whitespace-nowrap text-center border-l border-slate-50">
                      {editingCell?.employeeId === emp.id && editingCell?.type === 'masuk' ? (
                        /* Inline Editor for Masuk */
                        <div className="inline-flex items-center space-x-2 bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-200">
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <select
                            value={editPic}
                            onChange={(e) => setEditPic(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-emerald-500 w-24 cursor-pointer font-sans"
                          >
                            {OFFICER_LIST.map((officer) => (
                              <option key={officer} value={officer}>
                                {officer}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => saveEditing(emp.id, 'masuk')}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                            title="Simpan"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingCell(null)}
                            className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : isMasuk ? (
                        /* Logged state */
                        <div className="inline-flex flex-col items-center">
                          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-md px-2.5 py-1">
                            <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-tight">
                              DITERIMA
                            </span>
                            <button
                              onClick={() => startEditing(emp.id, 'masuk', masukDetails)}
                              className="font-mono text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                              title="Klik untuk ubah jam/Petugas"
                            >
                              {masukDetails.time} WIB
                            </button>
                            <span className="text-[9px] text-emerald-600 font-bold uppercase">by {masukDetails.pic}</span>
                            <button
                              onClick={() => handleQuickToggle(emp.id, 'masuk')}
                              className="text-slate-400 hover:text-rose-500 p-0.5 transition cursor-pointer"
                              title="Batalkan Serah Terima Masuk"
                            >
                              <Undo2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Empty state: action to set */
                        <button
                          onClick={() => handleQuickToggle(emp.id, 'masuk')}
                          className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg cursor-pointer transition uppercase tracking-wider"
                          id={`btn-setor-masuk-${emp.id}`}
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Serah Terima Masuk</span>
                        </button>
                      )}
                    </td>

                    {/* 2. TERIMA PULANG */}
                    <td className="px-6 py-4 whitespace-nowrap text-center border-l border-slate-50">
                      {editingCell?.employeeId === emp.id && editingCell?.type === 'pulang' ? (
                        /* Inline Editor for Pulang */
                        <div className="inline-flex items-center space-x-2 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-200">
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                          />
                          <select
                            value={editPic}
                            onChange={(e) => setEditPic(e.target.value)}
                            className="bg-white border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:border-indigo-500 w-24 cursor-pointer font-sans"
                          >
                            {OFFICER_LIST.map((officer) => (
                              <option key={officer} value={officer}>
                                {officer}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => saveEditing(emp.id, 'pulang')}
                            className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                            title="Simpan"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingCell(null)}
                            className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : isPulang ? (
                        /* Logged state */
                        <div className="inline-flex flex-col items-center">
                          <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 rounded-md px-2.5 py-1">
                            <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-tight">
                              DIKEMBALIKAN
                            </span>
                            <button
                              onClick={() => startEditing(emp.id, 'pulang', pulangDetails)}
                              className="font-mono text-xs font-bold text-indigo-800 hover:underline cursor-pointer"
                              title="Klik untuk ubah jam/Petugas"
                            >
                              {pulangDetails.time} WIB
                            </button>
                            <span className="text-[9px] text-indigo-600 font-bold uppercase">by {pulangDetails.pic}</span>
                            <button
                              onClick={() => handleQuickToggle(emp.id, 'pulang')}
                              className="text-slate-400 hover:text-rose-500 p-0.5 transition cursor-pointer"
                              title="Batalkan Serah Terima Pulang"
                            >
                              <Undo2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Empty state: action to set */
                        <button
                          onClick={() => handleQuickToggle(emp.id, 'pulang')}
                          disabled={!isMasuk}
                          className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded-lg border transition uppercase tracking-wider ${
                            isMasuk
                              ? 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30 border-indigo-200 dark:border-indigo-900/40 cursor-pointer'
                              : 'text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 cursor-not-allowed'
                          }`}
                          title={isMasuk ? 'Klik untuk mengembalikan paspor saat pulang' : 'Paspor harus diserahkan masuk dahulu'}
                          id={`btn-ambil-pulang-${emp.id}`}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Serah Terima Pulang</span>
                        </button>
                      )}
                    </td>

                    {/* CATATAN */}
                    <td className="px-6 py-4 whitespace-nowrap border-l border-slate-50 dark:border-slate-800/50">
                      <div className="relative max-w-xs">
                        <input
                          type="text"
                          placeholder="Keterangan khusus..."
                          value={log?.notes || ''}
                          onChange={(e) => onUpdateNotes(emp.id, e.target.value)}
                          className="w-full text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-750 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-300 dark:focus:border-indigo-500 rounded-lg px-3 py-1.5 focus:outline-none transition-colors"
                          id={`input-notes-${emp.id}`}
                        />
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer statistics summary for current list */}
      <div className="bg-slate-50 dark:bg-slate-800/30 px-6 py-4 border-t border-slate-200 dark:border-slate-800 rounded-b-xl flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider transition-colors">
        <span>Karyawan terdaftar: {filteredEmployees.length} • total: {employees.filter(e => e.active).length}</span>
        {filteredEmployees.length > 0 && (
          <div className="flex space-x-5">
            <span className="flex items-center"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span>Setor: {filteredEmployees.filter(e => getLogForEmployee(e.id)?.masuk?.handed).length}</span>
            <span className="flex items-center"><span className="w-2 h-2 bg-indigo-500 rounded-full mr-1.5"></span>Pulang: {filteredEmployees.filter(e => getLogForEmployee(e.id)?.pulang?.handed).length}</span>
          </div>
        )}
      </div>


    </div>
  );
}
