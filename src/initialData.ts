/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Employee } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [
  // CS Department (27 Staff)
  { id: 'emp-1', name: 'FADLAN PRATAMA TAMBUNAN', passportNumber: 'C6814592', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-2', name: 'ZIKRI TRIANSYAH KAMAL', passportNumber: 'E7722009', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-3', name: 'NICO FEBRIAN', passportNumber: 'E3163410', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-4', name: 'HENGKI', passportNumber: 'E2612730', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-5', name: 'TAUFAN KHATULISTIWA', passportNumber: 'E2406129', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-6', name: 'ERIC SYAHPUTRA', passportNumber: 'E5525035', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-7', name: 'SAZU SAHPUTRA', passportNumber: 'C8490663', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-8', name: 'DIVA DAWWAS', passportNumber: 'X9302197', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-9', name: 'ADITYA PANCA NUGRAHA', passportNumber: 'E2929201', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-10', name: 'SURAJ KUMAR', passportNumber: 'E1714955', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-11', name: 'JOESQUENSEND GAVEROND', passportNumber: 'X2837768', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-12', name: 'ANDRE EVANDRO GINTING', passportNumber: 'E3524180', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-13', name: 'VERRI AYANG', passportNumber: 'E2929082', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-14', name: 'MUHAMMAD ANDRI AZMI', passportNumber: 'E2867309', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-15', name: 'RENATAN', passportNumber: 'E5152033', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-16', name: 'LEO JONATHAN LIM', passportNumber: 'C9041353', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-17', name: 'NICO ADRIANSYAH HUTAGAOL', passportNumber: 'X6653631', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-18', name: 'ARJUN', passportNumber: 'E2214449', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-19', name: 'RONNY', passportNumber: 'X2658487', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-20', name: 'AFIF RAIS', passportNumber: 'E3504038', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-21', name: 'MUHAMMAD FACHRI', passportNumber: 'E7092105', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-22', name: 'S G KEVINDRA NAIDU', passportNumber: 'E3503037', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-23', name: 'MORIS BILIEVE GINTING', passportNumber: 'E5801583', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-24', name: 'DIAZ HERMAWAN', passportNumber: 'X2726247', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-25', name: 'ADITYA RIWANA', passportNumber: 'E0913677', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-26', name: 'FERI ADYANTO', passportNumber: 'E5862182', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-27', name: 'RINITA SOFIAN', passportNumber: 'E0536455', department: 'CS', active: true, createdAt: '2026-06-01T08:00:00.000Z' },

  // KAPTEN KASIR Department (3 Staff)
  { id: 'emp-28', name: 'MAHESTA RAZ', passportNumber: 'E1757678', department: 'KAPTEN KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-29', name: 'FAISAL SABARYANTO', passportNumber: 'E2818631', department: 'KAPTEN KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-30', name: 'YOGI PERLIAN SYAHPUTRA', passportNumber: 'E4159055', department: 'KAPTEN KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },

  // KASIR Department (26 Staff)
  { id: 'emp-31', name: 'MOHD REZA PAHLEVI', passportNumber: 'E7467387', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-32', name: 'JAMENDRA PERANGIN ANGIN', passportNumber: 'E2864468', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-33', name: 'MUHAMMAD FAHRI KURNIAWAN', passportNumber: 'E9991091', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-34', name: 'MUH MARWIANTO', passportNumber: 'C8479150', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-35', name: 'TANIA WIRANTI', passportNumber: 'E6253452', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-36', name: 'WINDA AGUSTIA', passportNumber: 'E7647231', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-37', name: 'DONI SAPUTRA NAHAMPUN', passportNumber: 'E7694440', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-38', name: 'CINDY SAPUTRI', passportNumber: 'X7900967', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-39', name: 'SADINA NST', passportNumber: 'E7530733', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-40', name: 'MUHLIS', passportNumber: 'E5049051', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-41', name: 'SAHARUDDIN', passportNumber: 'X3673527', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-42', name: 'ENDY LIE', passportNumber: 'E8451705', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-43', name: 'MUHAMMAD AZRI', passportNumber: 'E8726881', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-44', name: 'MOYNITA CHRISMA SEMBIRING', passportNumber: 'E0621159', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-45', name: 'IMELDA LESTARI', passportNumber: 'X4809279', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-46', name: 'TEDY', passportNumber: 'C7615156', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-47', name: 'YOLANDA LUBIS', passportNumber: 'E7088470', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-48', name: 'MELANI', passportNumber: 'E4723253', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-49', name: 'ANTONI', passportNumber: 'C9740702', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-50', name: 'ADE SAEPUDIN', passportNumber: 'E5582962', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-51', name: 'MARTIN LESMANA', passportNumber: 'E7722064', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-52', name: 'ARIEF FADLI WAHYU', passportNumber: 'X4788021', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-53', name: 'COCO FRAN SISCO', passportNumber: 'X6958677', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-54', name: 'FENDI CANDRA', passportNumber: 'X2242324', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-55', name: 'RIZKY PRADANA NAIBAHO', passportNumber: 'E2364836', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' },
  { id: 'emp-56', name: 'OKTOBERIUS HASRAT SETIAWAN GEA', passportNumber: 'X2811533', department: 'KASIR', active: true, createdAt: '2026-06-01T08:00:00.000Z' }
];

export const DEPARTMENTS = [
  'CS',
  'KAPTEN KASIR',
  'KASIR'
];
