import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Read seed data
const seedDataPath = path.join(__dirname, 'seed.json');
const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

// Initialize database
const dbPath = path.join(__dirname, 'prospects.db');

// Remove existing database if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create tables
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

console.log('Created database tables');

// Prepare insert statement
const insertProspect = db.prepare(`
  INSERT INTO prospects (
    business_name, business_type, location, phone, email,
    current_web_presence, listing_url, years_in_business,
    status, notes
  ) VALUES (
    @business_name, @business_type, @location, @phone, @email,
    @current_web_presence, @listing_url, @years_in_business,
    'not_contacted', @notes
  )
`);

const insertActivity = db.prepare(`
  INSERT INTO activity_log (prospect_id, action, details)
  VALUES (?, 'created', 'Prospect imported from seed data')
`);

// Insert all prospects in a transaction
const insertAll = db.transaction((prospects: typeof seedData) => {
  for (const prospect of prospects) {
    const result = insertProspect.run({
      business_name: prospect.business_name,
      business_type: prospect.business_type,
      location: prospect.location,
      phone: prospect.phone || null,
      email: prospect.email || null,
      current_web_presence: prospect.current_web_presence,
      listing_url: prospect.listing_url || null,
      years_in_business: prospect.years_in_business || null,
      notes: prospect.notes || null,
    });
    insertActivity.run(result.lastInsertRowid);
  }
});

insertAll(seedData);

console.log(`✓ Successfully seeded ${seedData.length} prospects`);

// Verify
const count = db.prepare('SELECT COUNT(*) as count FROM prospects').get() as { count: number };
console.log(`✓ Database now contains ${count.count} prospects`);

db.close();
