/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Employee {
  id: string;
  name: string;
  passportNumber: string;
  department: string;
  active: boolean;
  createdAt: string;
}

export interface HandoverDetails {
  handed: boolean;
  time: string; // HH:MM
  pic: string;  // Person In Charge
}

export interface PassportLog {
  id: string; // format: YYYY-MM-DD_employeeId
  date: string; // YYYY-MM-DD
  employeeId: string;
  masuk: HandoverDetails;
  pulang: HandoverDetails;
  notes: string;
}

export interface DailyStats {
  totalEmployees: number;
  handedInMasuk: number;
  handedInPulang: number;
  currentlyHeld: number; // Masuk = true, Pulang = false
  pendingToday: number;
}
