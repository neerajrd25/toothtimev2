import { Alert } from 'react-native';
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import CONFIG from '../config';

SQLite.enablePromise(true);

let dbInstance: SQLiteDatabase | null = null;

const openDB = async (): Promise<SQLiteDatabase> => {
  if (dbInstance) return dbInstance;
  try {
    const dbName = CONFIG.DB_NAME || 'toothtime.db';
    dbInstance = await SQLite.openDatabase({ name: dbName, location: 'default' });
    // Ensure users table exists
    await dbInstance.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        email TEXT,
        photo TEXT
      );`
    );
      // Ensure patients table exists
      await dbInstance.executeSql(
        `CREATE TABLE IF NOT EXISTS patients (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          phone TEXT,
          email TEXT,
          notes TEXT,
          first_visit_date TEXT,
          treatment_type TEXT
        );`
      );
      
      // Migration: Add missing columns if they don't exist (for existing databases)
      try {
        // Check if first_visit_date column exists
        const [checkResult] = await dbInstance.executeSql(
          `PRAGMA table_info(patients);`
        );
        const columns = [];
        for (let i = 0; i < checkResult.rows.length; i++) {
          columns.push(checkResult.rows.item(i).name);
        }
        
        if (!columns.includes('first_visit_date')) {
          await dbInstance.executeSql(
            `ALTER TABLE patients ADD COLUMN first_visit_date TEXT;`
          );
          console.log('Added first_visit_date column to patients table');
        }
        
        if (!columns.includes('treatment_type')) {
          await dbInstance.executeSql(
            `ALTER TABLE patients ADD COLUMN treatment_type TEXT;`
          );
          console.log('Added treatment_type column to patients table');
        }
      } catch (migrationError) {
        console.warn('Migration error (may be safe to ignore):', migrationError);
      }
      
      // Create treatments table (1-M relationship: patient -> treatments)
      await dbInstance.executeSql(
        `CREATE TABLE IF NOT EXISTS treatments (
          id TEXT PRIMARY KEY NOT NULL,
          patient_id TEXT NOT NULL,
          treatment_type TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'active',
          start_date TEXT,
          end_date TEXT,
          total_cost REAL,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        );`
      );
      
      // Create appointments table (1-M relationship: treatment -> appointments)
      await dbInstance.executeSql(
        `CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY NOT NULL,
          treatment_id TEXT NOT NULL,
          patient_id TEXT NOT NULL,
          appointment_date TEXT NOT NULL,
          appointment_time TEXT NOT NULL,
          duration_minutes INTEGER DEFAULT 30,
          status TEXT DEFAULT 'scheduled',
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE,
          FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
        );`
      );
      
    return dbInstance;
  } catch (e) {
    console.warn('openDB error', e);
    Alert.alert('Database error', String(e));
    throw e;
  }
};

type UserRecord = {
  id: string;
  name: string;
  email: string;
  photo?: string | null;
};

const saveUser = async (user: UserRecord): Promise<boolean> => {
  try {
    const db = await openDB();
    await db.executeSql(
      'INSERT OR REPLACE INTO users (id, name, email, photo) VALUES (?, ?, ?, ?);',
      [user.id, user.name, user.email, user.photo ?? null]
    );
    return true;
  } catch (e) {
    console.warn('saveUser error', e);
    return false;
  }
};

const getUserById = async (id: string): Promise<UserRecord | null> => {
  try {
    const db = await openDB();
    const [result] = await db.executeSql('SELECT * FROM users WHERE id = ? LIMIT 1;', [id]);
    if (result.rows.length > 0) {
      const row = result.rows.item(0);
      return { id: row.id, name: row.name, email: row.email, photo: row.photo };
    }
    return null;
  } catch (e) {
    console.warn('getUserById error', e);
    return null;
  }
};

const getAllUsers = async (): Promise<UserRecord[]> => {
  try {
    const db = await openDB();
    const [result] = await db.executeSql('SELECT * FROM users;');
    const users: UserRecord[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      users.push({ id: row.id, name: row.name, email: row.email, photo: row.photo });
    }
    return users;
  } catch (e) {
    console.warn('getAllUsers error', e);
    return [];
  }
};

type PatientRecord = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  first_visit_date?: string | null;
  treatment_type?: string | null;
};

const createPatient = async (p: PatientRecord): Promise<boolean> => {
  try {
    const db = await openDB();
    await db.executeSql(
      'INSERT OR REPLACE INTO patients (id, name, phone, email, notes, first_visit_date, treatment_type) VALUES (?, ?, ?, ?, ?, ?, ?);',
      [
        p.id,
        p.name,
        p.phone ?? null,
        p.email ?? null,
        p.notes ?? null,
        p.first_visit_date ?? null,
        p.treatment_type ?? null,
      ]
    );
    return true;
  } catch (e) {
    console.warn('createPatient error', e);
    return false;
  }
};

const getPatients = async (): Promise<PatientRecord[]> => {
  try {
    const db = await openDB();
    const [result] = await db.executeSql('SELECT * FROM patients ORDER BY name COLLATE NOCASE;');
    const patients: PatientRecord[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
        patients.push({
          id: row.id,
          name: row.name,
          phone: row.phone,
          email: row.email,
          notes: row.notes,
          first_visit_date: row.first_visit_date,
          treatment_type: row.treatment_type,
        });
    }
    return patients;
  } catch (e) {
    console.warn('getPatients error', e);
    return [];
  }
};

const getTodaysPatients = async (): Promise<PatientRecord[]> => {
  try {
    const db = await openDB();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const [result] = await db.executeSql(
      'SELECT * FROM patients WHERE first_visit_date = ? ORDER BY name COLLATE NOCASE;',
      [todayStr]
    );
    const patients: PatientRecord[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      patients.push({
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        notes: row.notes,
        first_visit_date: row.first_visit_date,
        treatment_type: row.treatment_type,
      });
    }
    return patients;
  } catch (e) {
    console.warn('getTodaysPatients error', e);
    return [];
  }
};

// Treatment types
type TreatmentRecord = {
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
};

// Appointment types
type AppointmentRecord = {
  id: string;
  treatment_id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string | null;
  created_at?: string;
};

// Create a new treatment
const createTreatment = async (treatment: TreatmentRecord): Promise<boolean> => {
  try {
    const db = await openDB();
    await db.executeSql(
      `INSERT OR REPLACE INTO treatments 
       (id, patient_id, treatment_type, description, status, start_date, end_date, total_cost, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        treatment.id,
        treatment.patient_id,
        treatment.treatment_type,
        treatment.description ?? null,
        treatment.status,
        treatment.start_date ?? null,
        treatment.end_date ?? null,
        treatment.total_cost ?? null,
        treatment.notes ?? null,
      ]
    );
    return true;
  } catch (e) {
    console.warn('createTreatment error', e);
    return false;
  }
};

// Get treatments for a specific patient
const getTreatmentsByPatient = async (patientId: string): Promise<TreatmentRecord[]> => {
  try {
    const db = await openDB();
    const [result] = await db.executeSql(
      'SELECT * FROM treatments WHERE patient_id = ? ORDER BY created_at DESC;',
      [patientId]
    );
    const treatments: TreatmentRecord[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      treatments.push({
        id: row.id,
        patient_id: row.patient_id,
        treatment_type: row.treatment_type,
        description: row.description,
        status: row.status,
        start_date: row.start_date,
        end_date: row.end_date,
        total_cost: row.total_cost,
        notes: row.notes,
        created_at: row.created_at,
      });
    }
    return treatments;
  } catch (e) {
    console.warn('getTreatmentsByPatient error', e);
    return [];
  }
};

// Create a new appointment
const createAppointment = async (appointment: AppointmentRecord): Promise<boolean> => {
  try {
    const db = await openDB();
    await db.executeSql(
      `INSERT OR REPLACE INTO appointments 
       (id, treatment_id, patient_id, appointment_date, appointment_time, duration_minutes, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        appointment.id,
        appointment.treatment_id,
        appointment.patient_id,
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.duration_minutes,
        appointment.status,
        appointment.notes ?? null,
      ]
    );
    return true;
  } catch (e) {
    console.warn('createAppointment error', e);
    return false;
  }
};

// Get appointments for a specific treatment
const getAppointmentsByTreatment = async (treatmentId: string): Promise<AppointmentRecord[]> => {
  try {
    const db = await openDB();
    const [result] = await db.executeSql(
      'SELECT * FROM appointments WHERE treatment_id = ? ORDER BY appointment_date, appointment_time;',
      [treatmentId]
    );
    const appointments: AppointmentRecord[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      appointments.push({
        id: row.id,
        treatment_id: row.treatment_id,
        patient_id: row.patient_id,
        appointment_date: row.appointment_date,
        appointment_time: row.appointment_time,
        duration_minutes: row.duration_minutes,
        status: row.status,
        notes: row.notes,
        created_at: row.created_at,
      });
    }
    return appointments;
  } catch (e) {
    console.warn('getAppointmentsByTreatment error', e);
    return [];
  }
};

// Get all appointments for a patient (across all treatments)
const getAppointmentsByPatient = async (patientId: string): Promise<AppointmentRecord[]> => {
  try {
    const db = await openDB();
    const [result] = await db.executeSql(
      'SELECT * FROM appointments WHERE patient_id = ? ORDER BY appointment_date DESC, appointment_time DESC;',
      [patientId]
    );
    const appointments: AppointmentRecord[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      appointments.push({
        id: row.id,
        treatment_id: row.treatment_id,
        patient_id: row.patient_id,
        appointment_date: row.appointment_date,
        appointment_time: row.appointment_time,
        duration_minutes: row.duration_minutes,
        status: row.status,
        notes: row.notes,
        created_at: row.created_at,
      });
    }
    return appointments;
  } catch (e) {
    console.warn('getAppointmentsByPatient error', e);
    return [];
  }
};

// Get a single patient by ID
const getPatientById = async (id: string): Promise<PatientRecord | null> => {
  try {
    const db = await openDB();
    const [result] = await db.executeSql('SELECT * FROM patients WHERE id = ? LIMIT 1;', [id]);
    if (result.rows.length > 0) {
      const row = result.rows.item(0);
      return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        notes: row.notes,
        first_visit_date: row.first_visit_date,
        treatment_type: row.treatment_type,
      };
    }
    return null;
  } catch (e) {
    console.warn('getPatientById error', e);
    return null;
  }
};

// Get upcoming appointments (today and future) with patient details
const getUpcomingAppointments = async (): Promise<any[]> => {
  try {
    const db = await openDB();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const [result] = await db.executeSql(
      `SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.duration_minutes,
        a.status,
        a.notes,
        p.name as patient_name,
        p.phone as patient_phone,
        t.treatment_type
      FROM appointments a
      INNER JOIN patients p ON a.patient_id = p.id
      INNER JOIN treatments t ON a.treatment_id = t.id
      WHERE a.appointment_date >= ? AND a.status = 'scheduled'
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      LIMIT 10;`,
      [todayStr]
    );
    
    const appointments: any[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const row = result.rows.item(i);
      appointments.push({
        id: row.id,
        appointment_date: row.appointment_date,
        appointment_time: row.appointment_time,
        duration_minutes: row.duration_minutes,
        status: row.status,
        notes: row.notes,
        patient_name: row.patient_name,
        patient_phone: row.patient_phone,
        treatment_type: row.treatment_type,
      });
    }
    return appointments;
  } catch (e) {
    console.warn('getUpcomingAppointments error', e);
    return [];
  }
};

export default {
  openDB,
  saveUser,
  getUserById,
  getAllUsers,
  createPatient,
  getPatients,
  getTodaysPatients,
  getPatientById,
  createTreatment,
  getTreatmentsByPatient,
  createAppointment,
  getAppointmentsByTreatment,
  getAppointmentsByPatient,
  getUpcomingAppointments,
};
