import * as SQLite from 'expo-sqlite';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Initialize local SQLite database
export const db = SQLite.openDatabaseSync('agro_offline.db');

export interface PendingAction {
  id: string;
  endpoint: string;
  method: string;
  payload: string; // JSON string
  timestamp: number;
}

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS PendingActions (
      id TEXT PRIMARY KEY,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      payload TEXT,
      timestamp INTEGER NOT NULL
    );
  `);
  console.log("Offline SQLite Database initialized.");
}

export function addPendingAction(endpoint: string, method: string, payload: any) {
  const stmt = db.prepareSync('INSERT INTO PendingActions (id, endpoint, method, payload, timestamp) VALUES (?, ?, ?, ?, ?)');
  stmt.executeSync([
    uuidv4(),
    endpoint,
    method,
    JSON.stringify(payload),
    Date.now()
  ]);
  console.log(`Action added to offline queue: ${method} ${endpoint}`);
}

export function getPendingActions(): PendingAction[] {
  return db.getAllSync('SELECT * FROM PendingActions ORDER BY timestamp ASC') as PendingAction[];
}

export function removePendingAction(id: string) {
  const stmt = db.prepareSync('DELETE FROM PendingActions WHERE id = ?');
  stmt.executeSync([id]);
}
