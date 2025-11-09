// Navigation types
export type NavigationStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  Dashboard: undefined;
};

// Bottom Tab Navigation types
export type DashboardTabParamList = {
  Home: undefined;
  Patients: undefined;
  Calendar: undefined;
  Settings: undefined;
};

// User types (matching auth service)
export interface User {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
}

// Appointment types
export interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// Patient type
export interface Patient {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  firstVisitDate?: string | null; // ISO date string e.g. 2025-11-08
  treatmentType?: 'Root Canal' | 'Implants' | null;
}