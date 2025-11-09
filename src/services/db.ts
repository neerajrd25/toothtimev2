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

export default {
  openDB,
  saveUser,
  getUserById,
  getAllUsers,
  createPatient,
  getPatients,
  getTodaysPatients,
};
