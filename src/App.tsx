/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Employee, PassportLog, DailyStats } from './types';
import { INITIAL_EMPLOYEES } from './initialData';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import DailyHandoverTable, { OFFICER_LIST } from './components/DailyHandoverTable';
import EmployeeMaster from './components/EmployeeMaster';
import MonthlyReportView from './components/MonthlyReportView';
import SpreadsheetModal from './components/SpreadsheetModal';
import LoginGate from './components/LoginGate';
import { ShieldAlert, RefreshCw, Cloud, CloudOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function App() {
  // Initialize States from localStorage or default configurations
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<Record<string, PassportLog>>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'daily' | 'employees' | 'monthly'>('daily');
  const [defaultPic, setDefaultPic] = useState<string>('FADLAN PRATAMA');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);

  // Theme & Login states
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Custom Backup Import & Toast States
  const [importConfirmTarget, setImportConfirmTarget] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-Sync States and Refs
  const [autoSyncStatus, setAutoSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [autoSyncError, setAutoSyncError] = useState<string>('');
  const lastSyncHashRef = useRef<string>('');
  const lastDateRef = useRef<string>('');

  // Load and bootstrap initial data on first mount
  useEffect(() => {
    // 1. Get or set today's local date (e.g., "2026-06-24")
    const now = new Date();
    // Force date to match current local year/month/date format YYYY-MM-DD
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    setSelectedDate(formattedDate);

    // 2. Load Employees
    const savedEmployees = localStorage.getItem('passport_guard_employees');
    const isInitialized = localStorage.getItem('passport_guard_initialized');
    let currentEmployees: Employee[] = [];
    if (savedEmployees) {
      currentEmployees = JSON.parse(savedEmployees);
      // Migrate old data if necessary (if they have the old default 'Ahmad Syarifudin')
      if (currentEmployees.some(e => e.name === 'Ahmad Syarifudin')) {
        currentEmployees = INITIAL_EMPLOYEES;
        localStorage.setItem('passport_guard_employees', JSON.stringify(INITIAL_EMPLOYEES));
        localStorage.setItem('passport_guard_initialized', 'true');
        localStorage.removeItem('passport_guard_logs'); // Clear old logs too to avoid mismatch
      } else if (!isInitialized) {
        localStorage.setItem('passport_guard_initialized', 'true');
      }
    } else {
      currentEmployees = INITIAL_EMPLOYEES;
      localStorage.setItem('passport_guard_employees', JSON.stringify(INITIAL_EMPLOYEES));
      localStorage.setItem('passport_guard_initialized', 'true');
    }
    setEmployees(currentEmployees);

    // 3. Load Logs
    const cleanedSampleLogs = localStorage.getItem('passport_guard_logs_sample_removed');
    let currentLogs: Record<string, PassportLog> = {};
    if (cleanedSampleLogs === 'true') {
      const savedLogs = localStorage.getItem('passport_guard_logs');
      if (savedLogs) {
        currentLogs = JSON.parse(savedLogs);
      }
    } else {
      // Clear any pre-existing sample logs to start fresh
      localStorage.setItem('passport_guard_logs_sample_removed', 'true');
      localStorage.setItem('passport_guard_logs', JSON.stringify({}));
      currentLogs = {};
    }
    setLogs(currentLogs);

    // 4. Load PIC Default
    const savedPic = localStorage.getItem('passport_guard_default_pic');
    if (savedPic && savedPic !== 'Bripda Dedi') {
      setDefaultPic(savedPic);
    } else {
      setDefaultPic('FADLAN PRATAMA');
      localStorage.setItem('passport_guard_default_pic', 'FADLAN PRATAMA');
    }

    // 5. Load Theme
    const savedTheme = localStorage.getItem('passport_guard_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }

    // 6. Load Login State
    const savedLogin = localStorage.getItem('passport_guard_logged_in') === 'true';
    setIsLoggedIn(savedLogin);

    setIsLoaded(true);
  }, []);

  // Auto-Sync hook to automatically push log updates to Google Spreadsheet
  useEffect(() => {
    if (!isLoaded || !selectedDate) return;

    // Calculate hash of current day's data
    const activeEmps = employees.filter(e => e.active);
    const dataHash = activeEmps.map(emp => {
      const logId = `${selectedDate}_${emp.id}`;
      const log = logs[logId];
      return `${emp.id}:${log?.masuk?.handed || false}:${log?.masuk?.time || ''}:${log?.masuk?.pic || ''}:${log?.pulang?.handed || false}:${log?.pulang?.time || ''}:${log?.pulang?.pic || ''}:${log?.notes || ''}`;
    }).join('|');

    // If date changed, reset state reference to avoid auto-triggering on date navigation
    const dateChanged = lastDateRef.current !== selectedDate;
    if (dateChanged) {
      lastDateRef.current = selectedDate;
      lastSyncHashRef.current = dataHash;
      setAutoSyncStatus('idle');
      return;
    }

    // Skip if data has not changed
    if (lastSyncHashRef.current === dataHash) {
      return;
    }

    setAutoSyncStatus('syncing');

    const delayDebounce = setTimeout(async () => {
      const webAppUrl = localStorage.getItem('passport_guard_sheet_url');
      if (!webAppUrl || !webAppUrl.trim()) {
        setAutoSyncStatus('idle');
        return;
      }

      // Prepare payload data
      const payloadData = activeEmps.map(emp => {
        const logId = `${selectedDate}_${emp.id}`;
        const log = logs[logId];
        return {
          date: selectedDate,
          employeeId: emp.id,
          name: emp.name,
          passportNumber: emp.passportNumber,
          department: emp.department,
          masukHanded: log?.masuk?.handed || false,
          masukTime: log?.masuk?.time || '',
          masukPic: log?.masuk?.pic || '',
          pulangHanded: log?.pulang?.handed || false,
          pulangTime: log?.pulang?.time || '',
          pulangPic: log?.pulang?.pic || '',
          notes: log?.notes || ''
        };
      });

      try {
        const response = await fetch('/api/proxy-sheet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: webAppUrl.trim(),
            payload: {
              action: 'sync',
              syncType: 'date',
              date: selectedDate,
              data: payloadData,
              employees: employees.map(emp => ({
                id: emp.id,
                name: emp.name,
                passportNumber: emp.passportNumber,
                department: emp.department,
                status: emp.active ? 'AKTIF' : 'NON-AKTIF'
              })),
              officers: OFFICER_LIST
            }
          })
        });

        const resData = await response.json();
        if (resData.success) {
          setAutoSyncStatus('success');
          lastSyncHashRef.current = dataHash;
          // Return to idle state after 3 seconds
          setTimeout(() => {
            setAutoSyncStatus(prev => prev === 'success' ? 'idle' : prev);
          }, 3000);
        } else {
          setAutoSyncStatus('error');
          setAutoSyncError(resData.message || 'Respons gagal dari Google Sheets');
        }
      } catch (err: any) {
        setAutoSyncStatus('error');
        setAutoSyncError(err.message || 'Koneksi jaringan terputus');
      }
    }, 1500); // 1.5 seconds debounce to group inputs together

    return () => clearTimeout(delayDebounce);
  }, [logs, employees, selectedDate, isLoaded]);

  // Sync state modifications to localStorage
  const saveEmployeesToStorage = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    localStorage.setItem('passport_guard_employees', JSON.stringify(updatedEmployees));
  };

  const saveLogsToStorage = (updatedLogs: Record<string, PassportLog>) => {
    setLogs(updatedLogs);
    localStorage.setItem('passport_guard_logs', JSON.stringify(updatedLogs));
  };

  const handleSetDefaultPic = (pic: string) => {
    setDefaultPic(pic);
    localStorage.setItem('passport_guard_default_pic', pic);
  };

  // Add Employee Handler
  const handleAddEmployee = (newEmpData: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmployee: Employee = {
      ...newEmpData,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...employees, newEmployee];
    saveEmployeesToStorage(updated);
  };

  // Update Employee Handler
  const handleUpdateEmployee = (id: string, updatedFields: Partial<Employee>) => {
    const updated = employees.map((emp) => 
      emp.id === id ? { ...emp, ...updatedFields } : emp
    );
    saveEmployeesToStorage(updated);
  };

  // Delete/Archive Employee Handler
  const handleDeleteEmployee = (id: string) => {
    // Hard delete to completely remove from list
    const updated = employees.filter((emp) => emp.id !== id);
    saveEmployeesToStorage(updated);
  };

  // Update Daily Handover Log Handler
  const handleUpdateLog = (
    employeeId: string, 
    type: 'masuk' | 'pulang', 
    details: { handed: boolean; time?: string; pic?: string }
  ) => {
    const logId = `${selectedDate}_${employeeId}`;
    const updatedLogs = { ...logs };
    
    // Create new log document if missing
    if (!updatedLogs[logId]) {
      updatedLogs[logId] = {
        id: logId,
        date: selectedDate,
        employeeId: employeeId,
        masuk: { handed: false, time: '', pic: '' },
        pulang: { handed: false, time: '', pic: '' },
        notes: '',
      };
    }

    // Update specific transaction segment
    if (type === 'masuk') {
      updatedLogs[logId].masuk = {
        handed: details.handed,
        time: details.handed ? (details.time || '') : '',
        pic: details.handed ? (details.pic || '') : '',
      };
    } else {
      updatedLogs[logId].pulang = {
        handed: details.handed,
        time: details.handed ? (details.time || '') : '',
        pic: details.handed ? (details.pic || '') : '',
      };
    }

    // Clean up completely empty logs to save localStorage space
    const isMasukEmpty = !updatedLogs[logId].masuk.handed;
    const isPulangEmpty = !updatedLogs[logId].pulang.handed;
    const areNotesEmpty = !updatedLogs[logId].notes.trim();

    if (isMasukEmpty && isPulangEmpty && areNotesEmpty) {
      delete updatedLogs[logId];
    }

    saveLogsToStorage(updatedLogs);
  };

  // Update Notes Handler
  const handleUpdateNotes = (employeeId: string, notes: string) => {
    const logId = `${selectedDate}_${employeeId}`;
    const updatedLogs = { ...logs };

    if (!updatedLogs[logId]) {
      updatedLogs[logId] = {
        id: logId,
        date: selectedDate,
        employeeId: employeeId,
        masuk: { handed: false, time: '', pic: '' },
        pulang: { handed: false, time: '', pic: '' },
        notes: '',
      };
    }

    updatedLogs[logId].notes = notes;

    // Clean up empty logs
    if (!updatedLogs[logId].masuk.handed && !updatedLogs[logId].pulang.handed && !notes.trim()) {
      delete updatedLogs[logId];
    }

    saveLogsToStorage(updatedLogs);
  };

  // Export database backup as JSON
  const handleExportBackup = () => {
    const backupData = {
      employees,
      logs,
      defaultPic,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `PassportGuard_Backup_${selectedDate}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger Custom Toast
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 3500);
  };

  // Toggle Dark/Light Theme
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('passport_guard_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('passport_guard_logged_in');
    triggerToast('Anda telah keluar dari sistem.', 'success');
  };

  // Import database backup from JSON
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.employees && imported.logs) {
          // Set to custom state to trigger confirmation modal instead of blocking window.confirm
          setImportConfirmTarget(imported);
        } else {
          triggerToast('Format file cadangan tidak valid.', 'error');
        }
      } catch {
        triggerToast('Gagal membaca file JSON cadangan.', 'error');
      }
      // Reset input value so same file can be imported again if needed
      event.target.value = '';
    };
    reader.readAsText(file);
  };

  // Compute Daily Statistics
  const getDailyStats = (): DailyStats => {
    const active = employees.filter((e) => e.active);
    const totalEmployees = active.length;
    let handedInMasuk = 0;
    let handedInPulang = 0;
    let currentlyHeld = 0;

    active.forEach((emp) => {
      const logId = `${selectedDate}_${emp.id}`;
      const log = logs[logId];
      const isMasuk = log?.masuk?.handed || false;
      const isPulang = log?.pulang?.handed || false;

      if (isMasuk) {
        handedInMasuk++;
        if (!isPulang) {
          currentlyHeld++;
        }
      }
      if (isPulang) {
        handedInPulang++;
      }
    });

    const pendingToday = totalEmployees - handedInMasuk;

    return {
      totalEmployees,
      handedInMasuk,
      handedInPulang,
      currentlyHeld,
      pendingToday
    };
  };

  // Loading Screen spinner
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <span className="text-slate-500 dark:text-slate-400 font-sans text-xs font-bold uppercase tracking-wider">Memuat Dashboard Passport...</span>
      </div>
    );
  }

  // Login Gate Screen
  if (!isLoggedIn) {
    return (
      <LoginGate
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogin={() => {
          setIsLoggedIn(true);
          localStorage.setItem('passport_guard_logged_in', 'true');
        }}
      />
    );
  }

  const currentStats = getDailyStats();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-800 dark:text-slate-100 pb-12 transition-colors duration-200">
      
      {/* 1. Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onExport={handleExportBackup}
        onImport={handleImportBackup}
        onOpenSpreadsheet={() => setIsSpreadsheetOpen(true)}
        theme={theme}
        toggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        autoSyncStatus={autoSyncStatus}
        autoSyncError={autoSyncError}
      />

      {/* 2. Main Content Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-1">
        
        {/* Statistics Banner for active/monthly tabs */}
        {activeTab !== 'employees' && (
          <div className="mb-6">
            <StatsCards stats={currentStats} />
          </div>
        )}

        {/* Tab content renders with transition animation */}
        <div className="relative" id="main-content-panels">
          <AnimatePresence mode="wait">
            
            {/* TAB: DAILY LOGBOOK */}
            {activeTab === 'daily' && (
              <motion.div
                key="daily-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Logbook Kehadiran Paspor Harian
                      </h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Pencatatan serah terima paspor untuk tanggal {selectedDate}
                      </p>
                    </div>
                  </div>

                  <DailyHandoverTable
                    employees={employees}
                    logs={logs}
                    selectedDate={selectedDate}
                    defaultPic={defaultPic}
                    setDefaultPic={handleSetDefaultPic}
                    onUpdateLog={handleUpdateLog}
                    onUpdateNotes={handleUpdateNotes}
                  />
                </div>
              </motion.div>
            )}

            {/* TAB: MONTHLY REPORT REKAPITULASI */}
            {activeTab === 'monthly' && (
              <motion.div
                key="monthly-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <MonthlyReportView
                  employees={employees}
                  logs={logs}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  setActiveTab={setActiveTab}
                />
              </motion.div>
            )}

            {/* TAB: EMPLOYEE MASTER */}
            {activeTab === 'employees' && (
              <motion.div
                key="employees-panel"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <EmployeeMaster
                  employees={employees}
                  onAddEmployee={handleAddEmployee}
                  onUpdateEmployee={handleUpdateEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* 3. Google Spreadsheet Integration Modal */}
      <SpreadsheetModal
        isOpen={isSpreadsheetOpen}
        onClose={() => setIsSpreadsheetOpen(false)}
        employees={employees}
        logs={logs}
        selectedDate={selectedDate}
        autoSyncStatus={autoSyncStatus}
        autoSyncError={autoSyncError}
      />

      {/* 5. Custom Restore Backup Confirmation Modal */}
      {importConfirmTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center space-x-3.5 pb-2 border-b border-slate-100">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/50">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Restore Database?</h3>
                <p className="text-[10px] text-slate-400 font-medium">TINDAKAN REVERSIBEL</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Apakah Anda yakin ingin menimpa data saat ini dengan data dari file cadangan ini? Tindakan ini akan menggantikan seluruh daftar karyawan dan riwayat log paspor Anda.
            </p>

            <div className="flex space-x-2 pt-2 justify-end">
              <button
                onClick={() => setImportConfirmTarget(null)}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  saveEmployeesToStorage(importConfirmTarget.employees);
                  saveLogsToStorage(importConfirmTarget.logs);
                  if (importConfirmTarget.defaultPic) {
                    handleSetDefaultPic(importConfirmTarget.defaultPic);
                  }
                  setImportConfirmTarget(null);
                  triggerToast('Data berhasil dipulihkan dari cadangan!', 'success');
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Ya, Pulihkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Custom Elegant Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-[120] flex items-center bg-slate-900 text-white shadow-2xl border border-slate-800 rounded-2xl py-3.5 px-5 space-x-3 max-w-sm animate-fade-in animate-slide-up">
          <div className="flex-shrink-0">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <p className="text-xs font-semibold tracking-wide font-sans text-slate-200">
            {toast.message}
          </p>
        </div>
      )}

    </div>
  );
}
