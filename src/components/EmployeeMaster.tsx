/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Employee } from '../types';
import { DEPARTMENTS } from '../initialData';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Search, 
  Building2, 
  CreditCard, 
  UserCheck, 
  X,
  AlertCircle
} from 'lucide-react';

interface EmployeeMasterProps {
  employees: Employee[];
  onAddEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => void;
  onUpdateEmployee: (id: string, updatedFields: Partial<Employee>) => void;
  onDeleteEmployee: (id: string) => void;
}

export default function EmployeeMaster({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}: EmployeeMasterProps) {
  // Local state for Form
  const [name, setName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [customDept, setCustomDept] = useState('');
  const [useCustomDept, setUseCustomDept] = useState(false);
  
  // Edit mode tracking
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Custom delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState('');

  // Submit hander (Add or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!name.trim()) {
      setFormError('Nama lengkap karyawan harus diisi.');
      return;
    }
    if (!passportNumber.trim()) {
      setFormError('Nomor Paspor harus diisi.');
      return;
    }

    const finalPassport = passportNumber.trim().toUpperCase();
    const finalDept = useCustomDept ? customDept.trim() : department;

    if (!finalDept) {
      setFormError('Departemen harus dipilih atau diisi.');
      return;
    }

    // Check for duplicate passport (excluding the employee being edited)
    const isDuplicate = employees.some(
      (emp) => emp.active && emp.id !== editingId && emp.passportNumber.toUpperCase() === finalPassport
    );

    if (isDuplicate) {
      setFormError(`Nomor Paspor ${finalPassport} sudah terdaftar dan masih aktif.`);
      return;
    }

    if (editingId) {
      // Update Mode
      onUpdateEmployee(editingId, {
        name: name.trim(),
        passportNumber: finalPassport,
        department: finalDept,
      });
      setEditingId(null);
    } else {
      // Add Mode
      onAddEmployee({
        name: name.trim(),
        passportNumber: finalPassport,
        department: finalDept,
        active: true,
      });
    }

    // Reset Form
    resetForm();
  };

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setName(emp.name);
    setPassportNumber(emp.passportNumber);
    setFormError('');

    // Check if department is in standard list
    if (DEPARTMENTS.includes(emp.department)) {
      setDepartment(emp.department);
      setUseCustomDept(false);
      setCustomDept('');
    } else {
      setUseCustomDept(true);
      setCustomDept(emp.department);
    }
  };

  const resetForm = () => {
    setName('');
    setPassportNumber('');
    setDepartment(DEPARTMENTS[0]);
    setCustomDept('');
    setUseCustomDept(false);
    setEditingId(null);
    setFormError('');
  };

  // Filter active employees
  const activeEmployees = employees.filter((emp) => emp.active);
  const filteredEmployees = activeEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="employee-master-module">
      
      {/* 1. Left Column: Add/Edit Form Card */}
      <div className="lg:col-span-4" id="employee-form-container">
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 sticky top-6">
          <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100/55">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                {editingId ? 'Ubah Data Karyawan' : 'Registrasi Karyawan'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {editingId ? 'Ubah profil & paspor' : 'Daftarkan paspor ke master database'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input Nama Lengkap */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Syarifudin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white"
                  required
                />
              </div>
            </div>

            {/* Input Nomor Paspor */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Nomor Paspor
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: C1234567"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white uppercase font-mono font-bold tracking-wider"
                  required
                />
              </div>
            </div>

            {/* Input Departemen */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Departemen / Unit Kerja
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomDept(!useCustomDept)}
                  className="text-[10px] text-indigo-600 font-bold hover:underline"
                >
                  {useCustomDept ? 'Pilih Daftar' : 'Tulis Manual'}
                </button>
              </div>

              {useCustomDept ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: Outsourcing"
                    value={customDept}
                    onChange={(e) => setCustomDept(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white"
                    required
                  />
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white cursor-pointer text-slate-700"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Error Message Panel */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start space-x-2 text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form Buttons */}
            <div className="flex space-x-2.5 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition flex items-center justify-center space-x-1 cursor-pointer"
                id="btn-save-employee"
              >
                <Plus className="w-4 h-4" />
                <span>{editingId ? 'Simpan Perubahan' : 'Daftarkan Karyawan'}</span>
              </button>

              {(editingId || name || passportNumber) && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2 px-3 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 mr-1" />
                  <span>Batal</span>
                </button>
              )}
            </div>

          </form>
        </div>
      </div>

      {/* 2. Right Column: Employees Directory Table */}
      <div className="lg:col-span-8" id="employees-directory-container">
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3 mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Direktori Karyawan Aktif</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Total terdaftar: {activeEmployees.length} karyawan</p>
            </div>

            {/* Directory Search Bar */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari karyawan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* Directory Grid */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200" id="employee-directory-table">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Nama Karyawan
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l border-slate-100">
                    Nomor Paspor
                  </th>
                  <th scope="col" className="px-5 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l border-slate-100">
                    Departemen
                  </th>
                  <th scope="col" className="px-5 py-3 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest border-l border-slate-100">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-slate-400 text-sm">
                      Tidak ada karyawan aktif yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/40 transition-colors border-b border-slate-100 last:border-0" id={`directory-row-${emp.id}`}>
                      
                      {/* Name */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-xs border border-indigo-100/50">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{emp.name}</span>
                        </div>
                      </td>

                      {/* Passport Number */}
                      <td className="px-5 py-3.5 whitespace-nowrap border-l border-slate-50">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 tracking-wider">
                          {emp.passportNumber}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-3.5 whitespace-nowrap border-l border-slate-50">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{emp.department}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm font-medium border-l border-slate-50">
                        <div className="flex justify-end space-x-1">
                          
                          <button
                            onClick={() => startEdit(emp)}
                            className={`p-1.5 text-slate-500 rounded hover:bg-indigo-50 hover:text-indigo-600 transition cursor-pointer ${
                              editingId === emp.id ? 'bg-indigo-50 text-indigo-600' : ''
                            }`}
                            title="Edit data karyawan"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteTarget(emp)}
                            className="p-1.5 text-slate-500 rounded hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                            title="Hapus Karyawan dari Database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-100 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center space-x-3.5 pb-2 border-b border-slate-100">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100/50">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hapus Karyawan?</h3>
                <p className="text-[10px] text-slate-400 font-medium">TINDAKAN PERMANEN</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Apakah Anda yakin ingin menghapus Karyawan <span className="font-bold text-slate-800">{deleteTarget.name}</span> dari database? Semua histori dan data paspor tidak akan lagi dikaitkan ke nama ini.
            </p>

            <div className="flex space-x-2 pt-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteEmployee(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
