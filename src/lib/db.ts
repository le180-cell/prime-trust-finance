import Database from 'better-sqlite3'
import path from 'path'
import bcrypt from 'bcryptjs'

const globalForDb = globalThis as unknown as { db: Database.Database }

function getDbPath(): string {
  if (process.env.VERCEL === "1") return "/tmp/data.db"
  return path.join(process.cwd(), 'db', 'data.db')
}

function ensureTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT DEFAULT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      username TEXT NOT NULL DEFAULT '',
      gender TEXT DEFAULT NULL,
      dateOfBirth TEXT DEFAULT NULL,
      nationalId TEXT DEFAULT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT DEFAULT NULL,
      district TEXT DEFAULT NULL,
      sector TEXT DEFAULT NULL,
      cell TEXT DEFAULT NULL,
      village TEXT DEFAULT NULL,
      occupation TEXT DEFAULT NULL,
      employer TEXT DEFAULT NULL,
      monthlyIncome TEXT DEFAULT NULL,
      maritalStatus TEXT DEFAULT NULL,
      securityQuestion TEXT DEFAULT NULL,
      profilePhoto TEXT DEFAULT NULL,
      nationalIdDocument TEXT DEFAULT NULL,
      memberSince TEXT NOT NULL DEFAULT (datetime('now')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'default',
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      quote TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS news_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image TEXT DEFAULT NULL,
      published INTEGER NOT NULL DEFAULT 0,
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      value INTEGER NOT NULL DEFAULT 0,
      suffix TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT 'default',
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT DEFAULT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS linked_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      bankName TEXT NOT NULL,
      accountName TEXT NOT NULL,
      accountNumber TEXT NOT NULL,
      accountType TEXT NOT NULL DEFAULT 'checking',
      balance REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'RWF',
      logo TEXT DEFAULT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      accountId INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      reference TEXT DEFAULT NULL,
      status TEXT NOT NULL DEFAULT 'completed',
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (accountId) REFERENCES linked_accounts(id)
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON reset_tokens(token);
    CREATE INDEX IF NOT EXISTS idx_reset_tokens_userId ON reset_tokens(userId);
  `)
}

function columnExists(db: Database.Database, table: string, column: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>
  return columns.some((entry) => entry.name === column)
}

function migrateSchema(db: Database.Database) {
  const statements = [
    !columnExists(db, 'users', 'username') ? "ALTER TABLE users ADD COLUMN username TEXT" : null,
    !columnExists(db, 'members', 'username') ? "ALTER TABLE members ADD COLUMN username TEXT" : null,
    !columnExists(db, 'members', 'gender') ? "ALTER TABLE members ADD COLUMN gender TEXT" : null,
    !columnExists(db, 'members', 'dateOfBirth') ? "ALTER TABLE members ADD COLUMN dateOfBirth TEXT" : null,
    !columnExists(db, 'members', 'nationalId') ? "ALTER TABLE members ADD COLUMN nationalId TEXT" : null,
    !columnExists(db, 'members', 'district') ? "ALTER TABLE members ADD COLUMN district TEXT" : null,
    !columnExists(db, 'members', 'sector') ? "ALTER TABLE members ADD COLUMN sector TEXT" : null,
    !columnExists(db, 'members', 'cell') ? "ALTER TABLE members ADD COLUMN cell TEXT" : null,
    !columnExists(db, 'members', 'village') ? "ALTER TABLE members ADD COLUMN village TEXT" : null,
    !columnExists(db, 'members', 'occupation') ? "ALTER TABLE members ADD COLUMN occupation TEXT" : null,
    !columnExists(db, 'members', 'employer') ? "ALTER TABLE members ADD COLUMN employer TEXT" : null,
    !columnExists(db, 'members', 'monthlyIncome') ? "ALTER TABLE members ADD COLUMN monthlyIncome TEXT" : null,
    !columnExists(db, 'members', 'maritalStatus') ? "ALTER TABLE members ADD COLUMN maritalStatus TEXT" : null,
    !columnExists(db, 'members', 'securityQuestion') ? "ALTER TABLE members ADD COLUMN securityQuestion TEXT" : null,
    !columnExists(db, 'members', 'profilePhoto') ? "ALTER TABLE members ADD COLUMN profilePhoto TEXT" : null,
    !columnExists(db, 'members', 'nationalIdDocument') ? "ALTER TABLE members ADD COLUMN nationalIdDocument TEXT" : null,
  ].filter(Boolean) as string[]
  for (const statement of statements) db.exec(statement)
  if (columnExists(db, 'users', 'username')) {
    const users = db.prepare("SELECT id, email, username FROM users").all() as Array<{ id: number; email: string; username: string | null }>
    const updateUser = db.prepare("UPDATE users SET username = ? WHERE id = ?")
    for (const user of users) {
      if (!user.username) {
        const base = user.email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase() || `member${user.id}`
        updateUser.run(base, user.id)
      }
    }
  }
}

function seedData(db: Database.Database) {
  const userCount = (db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }).count
  if (userCount > 0) return

  const adminHash = bcrypt.hashSync('admin123', 10)
  db.prepare("INSERT OR IGNORE INTO users (email, username, passwordHash, role) VALUES (?, ?, ?, ?)").run('admin@ias.rw', 'admin', adminHash, 'admin')
  db.prepare("INSERT OR IGNORE INTO users (email, username, passwordHash, role) VALUES (?, ?, ?, ?)").run('member@ias.rw', 'member', adminHash, 'user')

  const services = [
    ['Savings', 'Flexible savings accounts with competitive interest rates to help your money grow securely.', 'savings', 0],
    ['Loans', 'Affordable loan products with transparent terms and quick approval processes.', 'loans', 1],
    ['Emergency Support', 'Quick-access emergency funds when you need them most, with minimal paperwork.', 'emergency', 2],
    ['Investments', 'Smart investment opportunities designed to maximize returns for our members.', 'investments', 3],
    ['Digital Services', 'Modern digital banking platform for convenient account management anywhere, anytime.', 'digital', 4],
    ['Member Portal', 'Dedicated member portal with 24/7 access to your financial information and tools.', 'portal', 5],
  ]
  const serviceStmt = db.prepare("INSERT OR IGNORE INTO services (title, description, icon, sortOrder) VALUES (?, ?, ?, ?)")
  for (const s of services) serviceStmt.run(...s)

  const testimonials = [
    ['Jean-Pierre Habimana', 'Member since 2025', 'IAS helped me start my small business with an affordable loan. The process was smooth and the staff were incredibly supportive throughout.', 5, 0],
    ['Alice Mukamana', 'Member since 2024', "I've been saving with IAS and the interest rates are excellent. I trust them completely with my family's financial future.", 5, 1],
    ['David Niyonzima', 'Member since 2025', 'The emergency support fund was a lifesaver when my family needed urgent medical care. Quick approval and compassionate service. Highly recommended!', 5, 2],
    ['Grace Uwimana', 'Member since 2026', 'As a teacher, I needed a reliable savings plan. IAS offered the best terms and their digital platform makes managing my account so easy.', 4, 3],
  ]
  const testimonialStmt = db.prepare("INSERT INTO testimonials (name, role, quote, rating, sortOrder) VALUES (?, ?, ?, ?, ?)")
  for (const t of testimonials) testimonialStmt.run(...t)

  const newsItems = [
    ['IAS Launches New Digital Banking Platform', 'digital-banking-launch', 'Our new digital platform makes it easier than ever to manage your savings, apply for loans, and track your financial growth from anywhere.', '2026-03-15', 1],
    ['Annual Member Meeting: Record Growth in 2025', 'annual-meeting-2025', 'We reported a 25% increase in member savings and disbursed over 10 billion RWF in loans during our Annual General Meeting.', '2026-01-28', 1],
    ['New Savings Products with Competitive Interest Rates', 'new-savings-products', 'Introducing flexible savings plans designed to help members achieve their financial goals faster with enhanced interest rates.', '2025-12-05', 1],
  ]
  const newsStmt = db.prepare("INSERT OR IGNORE INTO news_items (title, slug, excerpt, date, published) VALUES (?, ?, ?, ?, ?)")
  for (const n of newsItems) newsStmt.run(...n)

  const statistics = [
    ['Active Members', 20000, '+', 'users', 0],
    ['Member Savings', 45, 'B+ RWF', 'savings', 1],
    ['Loan Recovery', 98, '%', 'recovery', 2],
    ['Founded', 2026, '', 'calendar', 3],
  ]
  const statStmt = db.prepare("INSERT OR IGNORE INTO statistics (label, value, suffix, icon, sortOrder) VALUES (?, ?, ?, ?, ?)")
  for (const s of statistics) statStmt.run(...s)

  const partners = ['Bank of Rwanda', 'Rwanda Cooperative Agency', 'Access Bank', 'Equity Bank', 'MTN Rwanda', 'Airtel Rwanda', 'RURA', 'RDB']
  const partnerStmt = db.prepare("INSERT OR IGNORE INTO partners (name, sortOrder) VALUES (?, ?)")
  for (let i = 0; i < partners.length; i++) partnerStmt.run(partners[i], i)

  const settingsStmt = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)")
  const defaultSettings = [
    ['bank_api_mode', 'simulation'], ['bank_api_base_url', ''], ['bank_api_client_id', ''],
    ['bank_api_client_secret', ''], ['bank_name', ''], ['ias_account_number', '4074200086837'],
  ]
  for (const [k, v] of defaultSettings) settingsStmt.run(k, v)
}

function initDb(): Database.Database {
  const dbPath = getDbPath()
  const isVercel = process.env.VERCEL === "1"
  if (isVercel) {
    const fs = require('fs')
    const dir = path.dirname(dbPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  }
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  ensureTables(db)
  migrateSchema(db)
  seedData(db)
  return db
}

export const db = globalForDb.db ?? initDb()

if (process.env.NODE_ENV !== 'production') globalForDb.db = db

export { Database }
