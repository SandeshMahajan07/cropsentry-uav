import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../../database.sqlite');

export const db = new DatabaseSync(dbPath);

// Enable Foreign Keys and WAL mode
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS drones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drone_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      last_seen_at TEXT,
      last_known_lat REAL,
      last_known_lng REAL,
      last_battery_percent INTEGER
    );

    CREATE TABLE IF NOT EXISTS detections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drone_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      object_temp_celsius REAL NOT NULL,
      ambient_temp_celsius REAL NOT NULL,
      delta REAL NOT NULL,
      image_url TEXT,
      status TEXT CHECK(status IN ('below_threshold', 'confirmed_candidate')) NOT NULL,
      alert_sent INTEGER DEFAULT 0 NOT NULL,
      reviewed_status TEXT CHECK(reviewed_status IN ('unreviewed', 'confirmed_real', 'false_alarm')) DEFAULT 'unreviewed' NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (drone_id) REFERENCES drones (drone_id) ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alert_recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      active INTEGER DEFAULT 1 NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      detection_id INTEGER NOT NULL,
      recipient_phone TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      status TEXT CHECK(status IN ('sent', 'failed')) NOT NULL,
      provider_response TEXT,
      FOREIGN KEY (detection_id) REFERENCES detections (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drone_id TEXT,
      alert_threshold_celsius REAL NOT NULL DEFAULT 8.0,
      dedup_radius_meters REAL NOT NULL DEFAULT 50.0,
      dedup_time_window_minutes INTEGER NOT NULL DEFAULT 10,
      callmebot_api_key TEXT,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (drone_id) REFERENCES drones (drone_id) ON DELETE CASCADE
    );
  `);

  // Safe migration for existing config table
  try {
    db.exec(`ALTER TABLE config ADD COLUMN callmebot_api_key TEXT;`);
  } catch (err) {
    // Column already exists or table freshly created
  }

  console.log('[DB] Database tables initialized successfully.');
}

