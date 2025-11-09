// Navigation types
export type NavigationStackParamList = {
  Splash: undefined;
  Login: undefined;
  SignUp: undefined;
  Dashboard: undefined;
  PatientDetail: { patientId: string };
  AddTreatment: { patientId: string };
  ScheduleAppointment: { patientId: string; treatmentId: string };
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

// Treatment type
export interface Treatment {
  id: string;
  patient_id: string;
  treatment_type: string;
  description?: string | null;
  status: 'active' | 'completed' | 'cancelled';
  start_date?: string | null;
  end_date?: string | null;
  total_cost?: number | null;
  notes?: string | null;
  created_at?: string;
}

// Appointment type (enhanced version for scheduling)
export interface AppointmentRecord {
  id: string;
  treatment_id: string;
  patient_id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string | null;
  created_at?: string;
}