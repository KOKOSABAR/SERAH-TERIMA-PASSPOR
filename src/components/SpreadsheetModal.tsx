/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, FileSpreadsheet, Copy, Check, Loader2, Wifi, WifiOff, 
  ChevronRight, Info, ExternalLink, RefreshCw, Send, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { Employee, PassportLog } from '../types';
import { OFFICER_LIST } from './DailyHandoverTable';

interface SpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  logs: Record<string, PassportLog>;
  selectedDate: string;
  autoSyncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  autoSyncError?: string;
}

async function readProxyResponse(response: Response) {
  const text = await response.text();
  let data: any = null;

  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || text || `HTTP ${response.status}`);
  }

  if (!data) {
    throw new Error(text || 'Respons server tidak valid');
  }

  return data;
}

export default function SpreadsheetModal({
  isOpen,
  onClose,
  employees,
  logs,
  selectedDate,
  autoSyncStatus = 'idle',
  autoSyncError = ''
}: SpreadsheetModalProps) {
  const [webAppUrl, setWebAppUrl] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'script' | 'guide'>('guide');

  // Google Apps Script code to copy
  const googleAppsScriptCode = `// KODE GOOGLE APPS SCRIPT - SISTEM LOGISTIK PASPOR (DYNAMIC & SYNCED)
// Salin semua kode ini dan tempelkan di Extensions > Apps Script pada Google Sheet Anda

function doPost(e) {
  var response = { success: false, message: "" };
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Pastikan Laporan Paspor ada dan terformat
    var reportSheet = ss.getSheetByName("Laporan Paspor");
    if (!reportSheet) {
      reportSheet = ss.insertSheet("Laporan Paspor");
    }
    ensureHeaders(reportSheet);
    
    // 2. Sinkronisasi Daftar Staff dinamis dari Dashboard jika dikirimkan
    if (requestData.employees && requestData.employees.length > 0) {
      var staffSheet = ss.getSheetByName("Daftar Staff");
      if (!staffSheet) {
        staffSheet = ss.insertSheet("Daftar Staff");
      }
      ensureStaffSheetHeaders(staffSheet);
      
      // Kosongkan dan ganti dengan data terupdate dari dashboard
      if (staffSheet.getLastRow() > 1) {
        staffSheet.deleteRows(2, staffSheet.getLastRow() - 1);
      }
      
      var staffRows = [];
      for (var k = 0; k < requestData.employees.length; k++) {
        var emp = requestData.employees[k];
        staffRows.push([
          emp.id,
          emp.name,
          emp.passportNumber,
          emp.department,
          emp.status
        ]);
      }
      staffSheet.getRange(2, 1, staffRows.length, staffRows[0].length).setValues(staffRows);
      staffSheet.autoResizeColumns(1, 5);
    }
    
    // 3. Sinkronisasi Dropdown Petugas dinamis dari Dashboard ke sheet terpisah jika dikirimkan
    if (requestData.officers && requestData.officers.length > 0) {
      var officersSheet = ss.getSheetByName("Daftar Petugas");
      if (!officersSheet) {
        officersSheet = ss.insertSheet("Daftar Petugas");
      }
      ensureOfficersSheetHeaders(officersSheet);
      
      // Kosongkan dan ganti dengan data terupdate dari dashboard
      if (officersSheet.getLastRow() > 1) {
        officersSheet.deleteRows(2, officersSheet.getLastRow() - 1);
      }
      
      var officerRows = [];
      for (var m = 0; m < requestData.officers.length; m++) {
        officerRows.push([requestData.officers[m]]);
      }
      officersSheet.getRange(2, 1, officerRows.length, 1).setValues(officerRows);
      officersSheet.autoResizeColumns(1, 1);
      
      // Buat validasi dropdown berdasarkan sheet "Daftar Petugas"
      ensureDropdownValidationFromSheet(reportSheet, officersSheet, officerRows.length);
    }
    
    // Set sheet aktif ke Laporan Paspor
    ss.setActiveSheet(reportSheet);
    
    if (action === "test") {
      response.success = true;
      response.message = "Koneksi berhasil! Lembar kerja 'Laporan Paspor', 'Daftar Staff', dan 'Daftar Petugas' telah berhasil dibuat, dikonfigurasi, dan disinkronkan dengan data dari dashboard.";
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "sync") {
      var data = requestData.data || [];
      var syncType = requestData.syncType; // "all" atau "date"
      var targetDate = requestData.date;
      
      // Ambil seluruh data yang ada saat ini dari sheet (baris 2 ke bawah)
      var lastRow = reportSheet.getLastRow();
      var values = lastRow > 1 ? reportSheet.getRange(2, 1, lastRow - 1, 13).getValues() : [];
      
      // Buat peta index baris berdasarkan kunci unik: Tanggal + ID Karyawan
      var rowMap = {};
      for (var i = 0; i < values.length; i++) {
        var rowDate = formatDate(values[i][0]);
        var rowEmpId = String(values[i][1]);
        if (rowDate && rowEmpId) {
          rowMap[rowDate + "_" + rowEmpId] = i;
        }
      }
      
      // Proses setiap data yang dikirim dari dashboard
      for (var j = 0; j < data.length; j++) {
        var item = data[j];
        var itemKey = item.date + "_" + item.employeeId;
        
        var rowData = [
          item.date,
          item.employeeId,
          item.name,
          item.passportNumber,
          item.department,
          item.masukHanded ? "DITERIMA" : "BELUM SETOR",
          item.masukTime || "-",
          item.masukPic || "-",
          item.pulangHanded ? "DIKEMBALIKAN" : "BELUM AMBIL",
          item.pulangTime || "-",
          item.pulangPic || "-",
          item.notes || "",
          new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
        ];
        
        if (rowMap.hasOwnProperty(itemKey)) {
          // Jika data sudah ada, perbarui baris tersebut (upsert)
          var targetIndex = rowMap[itemKey];
          values[targetIndex] = rowData;
        } else {
          // Jika data belum ada, tambahkan sebagai baris baru
          values.push(rowData);
          rowMap[itemKey] = values.length - 1;
        }
      }
      
      // Tulis kembali seluruh data terupdate ke spreadsheet secara massal (efisien & cepat)
      if (values.length > 0) {
        reportSheet.getRange(2, 1, values.length, 13).setValues(values);
        reportSheet.autoResizeColumns(1, 13);
      }
      
      response.success = true;
      response.message = "Berhasil sinkronisasi " + data.length + " data ke Google Spreadsheet (Menggunakan Metode Pintar Upsert)!";
    }
  } catch (error) {
    response.success = false;
    response.message = "Gagal memproses: " + error.toString();
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var reportSheet = ss.getSheetByName("Laporan Paspor");
  if (!reportSheet) {
    reportSheet = ss.insertSheet("Laporan Paspor");
  }
  ensureHeaders(reportSheet);
  
  var staffSheet = ss.getSheetByName("Daftar Staff");
  if (!staffSheet) {
    staffSheet = ss.insertSheet("Daftar Staff");
  }
  ensureStaffSheetHeaders(staffSheet);
  
  var officersSheet = ss.getSheetByName("Daftar Petugas");
  if (!officersSheet) {
    officersSheet = ss.insertSheet("Daftar Petugas");
  }
  ensureOfficersSheetHeaders(officersSheet);
  
  return ContentService.createTextOutput(JSON.stringify({ 
    success: true, 
    message: "Apps Script Aktif! Semua lembar kerja ('Laporan Paspor', 'Daftar Staff' & 'Daftar Petugas') siap disinkronkan secara real-time dari Dashboard." 
  })).setMimeType(ContentService.MimeType.JSON);
}

function ensureHeaders(sheet) {
  var headers = [
    "Tanggal", "ID Karyawan", "Nama Karyawan", "Nomor Paspor", "Departemen", 
    "Status Masuk", "Jam Masuk", "PIC Masuk", 
    "Status Pulang", "Jam Pulang", "PIC Pulang", 
    "Catatan", "Waktu Sinkronisasi"
  ];
  
  var firstRowValues = [];
  if (sheet.getLastRow() > 0) {
    firstRowValues = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  }
  
  var isHeaderValid = firstRowValues.length > 0 && firstRowValues[0] === "Tanggal";
  
  if (!isHeaderValid) {
    if (sheet.getLastRow() > 0) {
      sheet.insertRowsBefore(1, 1);
    }
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#334155"); // slate-700
    headerRange.setFontColor("#FFFFFF");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 35);
  }
  
  sheet.autoResizeColumns(1, headers.length);
}

function ensureDropdownValidationFromSheet(reportSheet, officersSheet, officersCount) {
  if (officersCount === 0) return;
  var lastRow = Math.max(200, reportSheet.getLastRow());
  var range = officersSheet.getRange(2, 1, officersCount, 1);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(range, true)
    .setAllowInvalid(true)
    .build();
    
  // Kolom 8 (PIC Masuk)
  reportSheet.getRange(2, 8, lastRow - 1, 1).setDataValidation(rule);
  // Kolom 11 (PIC Pulang)
  reportSheet.getRange(2, 11, lastRow - 1, 1).setDataValidation(rule);
}

function ensureOfficersSheetHeaders(sheet) {
  var headers = ["Nama Petugas"];
  
  var firstRowValues = [];
  if (sheet.getLastRow() > 0) {
    firstRowValues = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  }
  
  var isHeaderValid = firstRowValues.length > 0 && firstRowValues[0] === "Nama Petugas";
  
  if (!isHeaderValid) {
    if (sheet.getLastRow() > 0) {
      sheet.insertRowsBefore(1, 1);
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4f46e5"); // indigo-600
    headerRange.setFontColor("#FFFFFF");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 35);
  }
  sheet.autoResizeColumns(1, headers.length);
}

function ensureStaffSheetHeaders(sheet) {
  var headers = ["ID Karyawan", "Nama Staff", "Nomor Paspor", "Jabatan (Posisi)", "Status"];
  
  var firstRowValues = [];
  if (sheet.getLastRow() > 0) {
    firstRowValues = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  }
  
  var isHeaderValid = firstRowValues.length > 0 && firstRowValues[0] === "ID Karyawan";
  
  if (!isHeaderValid) {
    if (sheet.getLastRow() > 0) {
      sheet.insertRowsBefore(1, 1);
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0f172a"); // slate-900
    headerRange.setFontColor("#FFFFFF");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 35);
  }
  sheet.autoResizeColumns(1, headers.length);
}

function formatDate(dateVal) {
  if (!dateVal) return "";
  if (dateVal instanceof Date) {
    try {
      return Utilities.formatDate(dateVal, Session.getScriptTimeZone() || "Asia/Jakarta", "yyyy-MM-dd");
    } catch (e) {
      var yyyy = dateVal.getFullYear();
      var mm = String(dateVal.getMonth() + 1).padStart(2, '0');
      var dd = String(dateVal.getDate()).padStart(2, '0');
      return yyyy + "-" + mm + "-" + dd;
    }
  }
  var str = String(dateVal).trim();
  var match = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) {
    var yYear = match[1];
    var mMonth = match[2].length === 1 ? "0" + match[2] : match[2];
    var dDay = match[3].length === 1 ? "0" + match[3] : match[3];
    return yYear + "-" + mMonth + "-" + dDay;
  }
  return str.split("T")[0];
}`;

  // Load URL from localstorage
  useEffect(() => {
    const savedUrl = localStorage.getItem('passport_guard_sheet_url');
    if (savedUrl) {
      setWebAppUrl(savedUrl);
      setIsConnected(true);
    } else {
      setWebAppUrl('');
      setIsConnected(null);
    }
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveUrl = (url: string) => {
    setWebAppUrl(url);
    if (!url.trim()) {
      localStorage.removeItem('passport_guard_sheet_url');
      setIsConnected(null);
    } else {
      localStorage.setItem('passport_guard_sheet_url', url.trim());
    }
  };

  // Test connection and auto-create headers
  const testConnection = async () => {
    if (!webAppUrl.trim()) return;
    setIsTesting(true);
    setSyncMessage('');
    try {
      const response = await fetch('/api/proxy-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webAppUrl.trim(),
          payload: { 
            action: 'test',
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
      
      const resData = await readProxyResponse(response);
      if (resData.success) {
        setIsConnected(true);
        setSyncMessage('Koneksi sukses! Header tabel Google Spreadsheet dan daftar Staff telah terkonfigurasi otomatis.');
        localStorage.setItem('passport_guard_sheet_url', webAppUrl.trim());
      } else {
        setIsConnected(false);
        setSyncMessage(`Koneksi ditolak oleh script: ${resData.message}`);
      }
    } catch (err: any) {
      setIsConnected(false);
      setSyncMessage(`Gagal menghubungi Web App URL. Pastikan URL benar dan Apps Script telah dideploy sebagai 'Anyone'. Error: ${err.message || err}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Prepare logs data format for sheet bulk write
  const prepareData = (syncType: 'all' | 'date') => {
    const activeEmps = employees.filter(e => e.active);
    const result: any[] = [];

    if (syncType === 'date') {
      activeEmps.forEach(emp => {
        const logId = `${selectedDate}_${emp.id}`;
        const log = logs[logId];
        
        result.push({
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
        });
      });
    } else {
      // All logs
      // Generate keys of dates we have in logs
      const allDates = Array.from(new Set(Object.keys(logs).map(key => key.split('_')[0]))).sort();
      
      if (allDates.length === 0) {
        // If empty logs, just use today's template
        activeEmps.forEach(emp => {
          result.push({
            date: selectedDate,
            employeeId: emp.id,
            name: emp.name,
            passportNumber: emp.passportNumber,
            department: emp.department,
            masukHanded: false,
            masukTime: '',
            masukPic: '',
            pulangHanded: false,
            pulangTime: '',
            pulangPic: '',
            notes: ''
          });
        });
      } else {
        allDates.forEach(dateStr => {
          activeEmps.forEach(emp => {
            const logId = `${dateStr}_${emp.id}`;
            const log = logs[logId];
            
            // Only add if there is some activity, or let's add full matrix to keep spreadsheet super complete!
            // Adding everything keeps spreadsheet fully reflective of daily logs.
            result.push({
              date: dateStr,
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
            });
          });
        });
      }
    }

    return result;
  };

  const handleSync = async (syncType: 'all' | 'date') => {
    if (!webAppUrl.trim()) return;
    setIsSyncing(true);
    setSyncMessage('');
    const payloadData = prepareData(syncType);

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
            syncType,
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

      const resData = await readProxyResponse(response);
      if (resData.success) {
        setSyncMessage(`Sinkronisasi berhasil! ${payloadData.length} baris data berhasil disinkronkan.`);
        setIsConnected(true);
      } else {
        setSyncMessage(`Gagal sinkronisasi: ${resData.message}`);
      }
    } catch (err: any) {
      setSyncMessage(`Error saat sinkronisasi: ${err.message || err}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="spreadsheet-modal-backdrop">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" id="spreadsheet-modal">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Integrasi Google Spreadsheet</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Kirim data real-time logbook paspor langsung ke Google Sheets Anda
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            id="btn-close-spreadsheet-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Info Banner */}
          <div className="bg-indigo-50 border border-indigo-100/70 rounded-xl p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-800 leading-relaxed">
              <span className="font-bold">Sambungkan langsung ke Google Sheet Anda!</span> Sistem ini tidak memerlukan persetujuan login Google pihak ketiga yang rumit. Dengan bantuan <span className="font-bold">Google Apps Script</span>, data dikirim langsung secara mandiri dan aman ke spreadsheet Anda. Sistem akan membuatkan header kolom secara otomatis pada peluncuran pertama.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Hand: Connection Settings & Sync */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Box 1: Connection Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pengaturan Koneksi
                </h4>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Google Apps Script Web App URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={webAppUrl}
                    onChange={(e) => handleSaveUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white"
                    id="input-webapp-url"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/65">
                  <div className="flex items-center space-x-2">
                    {isConnected === true ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                        <Wifi className="w-3.5 h-3.5 mr-1" /> Terhubung
                      </span>
                    ) : isConnected === false ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wider">
                        <WifiOff className="w-3.5 h-3.5 mr-1" /> Terputus
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                        Belum Dikoneksikan
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={testConnection}
                    disabled={isTesting || !webAppUrl.trim()}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-extrabold rounded-lg transition disabled:bg-slate-300 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer inline-flex items-center"
                    id="btn-test-connection"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Hubungkan...
                      </>
                    ) : (
                      'Hubungkan & Buat Header'
                    )}
                  </button>
                </div>
              </div>

              {/* Box 2: Real-time Auto-Sync Status */}
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Sinkronisasi Otomatis
                  </h4>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Aktif & Real-time
                  </span>
                </div>

                <div className="bg-white/80 rounded-xl p-3.5 border border-emerald-100/60 shadow-2xs space-y-2">
                  <div className="flex items-center space-x-2 text-slate-700">
                    {autoSyncStatus === 'syncing' ? (
                      <Loader2 className="w-4.5 h-4.5 text-amber-500 animate-spin shrink-0" />
                    ) : autoSyncStatus === 'success' ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    ) : autoSyncStatus === 'error' ? (
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 animate-bounce" />
                    ) : (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-700 font-sans">
                      {autoSyncStatus === 'syncing' && 'Sedang menyimpan ke Sheets...'}
                      {autoSyncStatus === 'success' && 'Semua data tersimpan otomatis!'}
                      {autoSyncStatus === 'error' && 'Gagal sinkron otomatis'}
                      {autoSyncStatus === 'idle' && 'Terhubung & Siap Sinkron'}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    Setiap perubahan pada checklist, jam serah terima, petugas, atau catatan di dashboard akan <span className="font-bold text-emerald-600">disimpan secara otomatis</span> langsung ke spreadsheet Anda tanpa perlu menekan tombol apa pun.
                  </p>
                </div>
              </div>

              {/* Status Message Panel */}
              {syncMessage && (
                <div className={`p-3.5 rounded-xl border flex items-start space-x-2.5 text-xs font-semibold ${
                  syncMessage.includes('sukses') || syncMessage.includes('berhasil')
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}>
                  {syncMessage.includes('sukses') || syncMessage.includes('berhasil') ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{syncMessage}</span>
                </div>
              )}

            </div>

            {/* Right Hand: Documentation & Apps Script Source Code */}
            <div className="lg:col-span-7 flex flex-col border border-slate-200 rounded-xl overflow-hidden">
              
              {/* Tab Selector inside Card */}
              <div className="bg-slate-50 border-b border-slate-200 flex -mb-px">
                <button
                  onClick={() => setActiveInstructionTab('guide')}
                  className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                    activeInstructionTab === 'guide'
                      ? 'border-indigo-600 text-indigo-600 bg-white'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Panduan Setup (8 Langkah)
                </button>
                <button
                  onClick={() => setActiveInstructionTab('script')}
                  className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
                    activeInstructionTab === 'script'
                      ? 'border-indigo-600 text-indigo-600 bg-white'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Kode Google Apps Script
                </button>
              </div>

              {/* Instruction Panel Content */}
              <div className="p-5 flex-1 overflow-y-auto max-h-[420px] text-xs leading-relaxed text-slate-600">
                {activeInstructionTab === 'guide' ? (
                  <div className="space-y-4">
                    <p className="font-bold text-slate-800 text-xs">Cara Pasang dan Mengaktifkan Integrasi Spreadsheet:</p>
                    <ol className="space-y-3 list-decimal list-inside">
                      <li>
                        <span className="font-semibold text-slate-800">Buat Spreadsheet</span>: Buka Google Drive Anda, lalu buat dokumen Google Sheet kosong baru.
                      </li>
                      <li>
                        <span className="font-semibold text-slate-800">Buka Apps Script</span>: Klik menu <span className="font-medium bg-slate-100 text-slate-800 px-1 rounded">Ekstensi</span> &gt; <span className="font-medium bg-slate-100 text-slate-800 px-1 rounded">Apps Script</span> di bagian atas Google Sheet Anda.
                      </li>
                      <li>
                        <span className="font-semibold text-slate-800">Salin Kode</span>: Buka tab <span className="text-indigo-600 font-semibold cursor-pointer" onClick={() => setActiveInstructionTab('script')}>Kode Google Apps Script</span> di panel kanan ini, lalu klik tombol <span className="font-medium">Copy</span>.
                      </li>
                      <li>
                        <span className="font-semibold text-slate-800">Tempel Kode</span>: Hapus seluruh kode default bawaan Google Sheet, lalu tempelkan (<kbd className="bg-slate-100 px-1 rounded text-slate-800 font-mono">Ctrl+V</kbd>) kode yang sudah disalin tadi. Klik ikon <span className="font-semibold">Simpan</span> (gambar disket) di atas editor.
                      </li>
                      <li>
                        <span className="font-semibold text-slate-800">Terapkan Baru</span>: Klik tombol <span className="font-medium bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">Terapkan</span> (atau *Deploy*) &gt; <span className="font-medium">Penerapan Baru</span> (*New deployment*).
                      </li>
                      <li>
                        <span className="font-semibold text-slate-800">Ubah Konfigurasi Akses</span>: 
                        <ul className="list-disc list-inside pl-4 mt-1 text-[11px] text-slate-500 space-y-0.5">
                          <li>Klik ikon gerigi di sebelah "Pilih Jenis", pilih <span className="font-semibold text-slate-600">Aplikasi Web</span> (*Web app*).</li>
                          <li>Ubah bagian <span className="font-medium">Jalankan sebagai</span> (*Execute as*) menjadi <span className="font-semibold text-slate-600">Saya</span> (*Me*).</li>
                          <li>Ubah bagian <span className="font-medium">Siapa yang memiliki akses</span> (*Who has access*) menjadi <span className="font-semibold text-slate-600">Siapa saja</span> (*Anyone*).</li>
                        </ul>
                      </li>
                      <li>
                        <span className="font-semibold text-slate-800">Klik Terapkan & Izinkan</span>: Klik <span className="font-medium text-blue-600">Terapkan</span>. Jika Google memunculkan dialog verifikasi keamanan, klik <span className="font-medium">Izinkan Akses</span> (*Authorize access*), login dengan akun Google Anda, klik <span className="font-medium">Advanced</span> di kiri bawah, lalu klik <span className="font-medium">Go to Untitled project (unsafe)</span>, kemudian klik <span className="font-medium">Allow</span>.
                      </li>
                      <li>
                        <span className="font-semibold text-slate-800">Salin URL</span>: Setelah deploy berhasil, Google akan memberikan **URL Aplikasi Web** (berakhiran `/exec`). Salin URL tersebut dan masukkan ke kotak input di sebelah kiri, lalu klik <span className="font-semibold text-indigo-600">Hubungkan & Buat Header</span>!
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wide">Kode Sumber Google Apps Script</span>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold px-3 py-1 rounded-md transition shadow-2xs cursor-pointer"
                        id="btn-copy-script-code"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Tersalin!' : 'Salin Kode'}</span>
                      </button>
                    </div>
                    
                    <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[10px] overflow-x-auto max-h-[300px] border border-slate-800">
                      {googleAppsScriptCode}
                    </pre>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-2xs"
            id="btn-close-spreadsheet-modal-footer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
