import db, { Prospect, ProspectStatus, ActivityLog } from './db';

// Get all prospects with optional filters
export function getProspects(filters?: {
  status?: string;
  business_type?: string;
  location?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}): Prospect[] {
  let query = 'SELECT * FROM prospects WHERE 1=1';
  const params: Record<string, string> = {};

  if (filters?.status) {
    query += ' AND status = @status';
    params.status = filters.status;
  }
  if (filters?.business_type) {
    query += ' AND business_type = @business_type';
    params.business_type = filters.business_type;
  }
  if (filters?.location) {
    query += ' AND location = @location';
    params.location = filters.location;
  }

  const sortBy = filters?.sort_by || 'created_at';
  const sortOrder = filters?.sort_order || 'desc';
  const validSortColumns = ['business_name', 'last_contacted', 'next_followup', 'created_at', 'updated_at'];
  const validSortOrders = ['asc', 'desc'];

  if (validSortColumns.includes(sortBy) && validSortOrders.includes(sortOrder)) {
    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} NULLS LAST`;
  }

  return db.prepare(query).all(params) as Prospect[];
}

// Get single prospect by ID
export function getProspectById(id: number): Prospect | undefined {
  return db.prepare('SELECT * FROM prospects WHERE id = ?').get(id) as Prospect | undefined;
}

// Create new prospect
export function createProspect(data: Omit<Prospect, 'id' | 'created_at' | 'updated_at'>): Prospect {
  const stmt = db.prepare(`
    INSERT INTO prospects (
      business_name, business_type, location, phone, email,
      current_web_presence, listing_url, years_in_business,
      status, notes, last_contacted, next_followup
    ) VALUES (
      @business_name, @business_type, @location, @phone, @email,
      @current_web_presence, @listing_url, @years_in_business,
      @status, @notes, @last_contacted, @next_followup
    )
  `);

  const result = stmt.run({
    business_name: data.business_name,
    business_type: data.business_type,
    location: data.location,
    phone: data.phone || null,
    email: data.email || null,
    current_web_presence: data.current_web_presence,
    listing_url: data.listing_url || null,
    years_in_business: data.years_in_business || null,
    status: data.status || 'not_contacted',
    notes: data.notes || null,
    last_contacted: data.last_contacted || null,
    next_followup: data.next_followup || null,
  });

  // Log the creation
  logActivity(result.lastInsertRowid as number, 'created', 'Prospect created');

  return getProspectById(result.lastInsertRowid as number)!;
}

// Update prospect
export function updateProspect(id: number, data: Partial<Omit<Prospect, 'id' | 'created_at' | 'updated_at'>>): Prospect | undefined {
  const current = getProspectById(id);
  if (!current) return undefined;

  const fields: string[] = [];
  const params: Record<string, unknown> = { id };

  const allowedFields = [
    'business_name', 'business_type', 'location', 'phone', 'email',
    'current_web_presence', 'listing_url', 'years_in_business',
    'status', 'notes', 'last_contacted', 'next_followup'
  ];

  for (const field of allowedFields) {
    if (field in data) {
      fields.push(`${field} = @${field}`);
      params[field] = data[field as keyof typeof data] ?? null;
    }
  }

  if (fields.length === 0) return current;

  fields.push("updated_at = datetime('now')");

  const query = `UPDATE prospects SET ${fields.join(', ')} WHERE id = @id`;
  db.prepare(query).run(params);

  // Log status change if applicable
  if (data.status && data.status !== current.status) {
    logActivity(id, 'status_changed', `Status changed from "${formatStatus(current.status)}" to "${formatStatus(data.status)}"`);
  }

  return getProspectById(id);
}

// Delete prospect
export function deleteProspect(id: number): boolean {
  const result = db.prepare('DELETE FROM prospects WHERE id = ?').run(id);
  return result.changes > 0;
}

// Get stats for dashboard
export function getStats(): {
  total: number;
  not_contacted: number;
  in_progress: number;
  won: number;
  lost: number;
} {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'not_contacted' THEN 1 ELSE 0 END) as not_contacted,
      SUM(CASE WHEN status IN ('email_sent', 'called', 'meeting_scheduled', 'proposal_sent') THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won,
      SUM(CASE WHEN status IN ('lost', 'not_interested') THEN 1 ELSE 0 END) as lost
    FROM prospects
  `).get() as { total: number; not_contacted: number; in_progress: number; won: number; lost: number };

  return stats;
}

// Get unique values for filters
export function getFilterOptions(): {
  business_types: string[];
  locations: string[];
  statuses: string[];
} {
  const business_types = db.prepare('SELECT DISTINCT business_type FROM prospects ORDER BY business_type').all() as { business_type: string }[];
  const locations = db.prepare('SELECT DISTINCT location FROM prospects ORDER BY location').all() as { location: string }[];
  const statuses = db.prepare('SELECT DISTINCT status FROM prospects ORDER BY status').all() as { status: string }[];

  return {
    business_types: business_types.map(r => r.business_type),
    locations: locations.map(r => r.location),
    statuses: statuses.map(r => r.status),
  };
}

// Activity log functions
export function logActivity(prospectId: number, action: string, details?: string): void {
  db.prepare(`
    INSERT INTO activity_log (prospect_id, action, details)
    VALUES (?, ?, ?)
  `).run(prospectId, action, details || null);
}

export function getActivityLog(prospectId: number): ActivityLog[] {
  return db.prepare(`
    SELECT * FROM activity_log
    WHERE prospect_id = ?
    ORDER BY created_at DESC
  `).all(prospectId) as ActivityLog[];
}

// Log contact with note
export function logContact(
  prospectId: number,
  note: string,
  nextFollowup?: string
): Prospect | undefined {
  const today = new Date().toISOString().split('T')[0];

  db.prepare(`
    UPDATE prospects
    SET last_contacted = ?, next_followup = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(today, nextFollowup || null, prospectId);

  logActivity(prospectId, 'contact_logged', note);

  return getProspectById(prospectId);
}

// Helper to format status for display
function formatStatus(status: ProspectStatus): string {
  const statusMap: Record<ProspectStatus, string> = {
    not_contacted: 'Not Contacted',
    email_sent: 'Email Sent',
    called: 'Called',
    meeting_scheduled: 'Meeting Scheduled',
    proposal_sent: 'Proposal Sent',
    won: 'Won',
    lost: 'Lost',
    not_interested: 'Not Interested',
  };
  return statusMap[status] || status;
}

// Seed function for initial data
export function seedProspects(prospects: Array<{
  business_name: string;
  business_type: string;
  location: string;
  phone?: string | null;
  email?: string | null;
  current_web_presence: string;
  listing_url?: string | null;
  years_in_business?: number | null;
  notes?: string | null;
}>): void {
  const insertStmt = db.prepare(`
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

  const insertMany = db.transaction((items: typeof prospects) => {
    for (const item of items) {
      insertStmt.run({
        business_name: item.business_name,
        business_type: item.business_type,
        location: item.location,
        phone: item.phone || null,
        email: item.email || null,
        current_web_presence: item.current_web_presence,
        listing_url: item.listing_url || null,
        years_in_business: item.years_in_business || null,
        notes: item.notes || null,
      });
    }
  });

  insertMany(prospects);
}
