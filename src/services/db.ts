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

export default {
  openDB,
  saveUser,
  getUserById,
  getAllUsers,
};
