import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'prospects.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS prospects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    location TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    current_web_presence TEXT NOT NULL,
    listing_url TEXT,
    years_in_business INTEGER,
    status TEXT NOT NULL DEFAULT 'not_contacted',
    notes TEXT,
    last_contacted TEXT,
    next_followup TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prospect_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
  CREATE INDEX IF NOT EXISTS idx_prospects_business_type ON prospects(business_type);
  CREATE INDEX IF NOT EXISTS idx_prospects_location ON prospects(location);
  CREATE INDEX IF NOT EXISTS idx_activity_log_prospect_id ON activity_log(prospect_id);
`);

export default db;

export type ProspectStatus =
  | 'not_contacted'
  | 'email_sent'
  | 'called'
  | 'meeting_scheduled'
  | 'proposal_sent'
  | 'won'
  | 'lost'
  | 'not_interested';

export interface Prospect {
  id: number;
  business_name: string;
  business_type: string;
  location: string;
  phone: string | null;
  email: string | null;
  current_web_presence: string;
  listing_url: string | null;
  years_in_business: number | null;
  status: ProspectStatus;
  notes: string | null;
  last_contacted: string | null;
  next_followup: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  prospect_id: number;
  action: string;
  details: string | null;
  created_at: string;
}
