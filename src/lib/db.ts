import path from 'path'
import bcrypt from 'bcryptjs'

type Row = Record<string, unknown> | undefined
type RowArray = Record<string, unknown>[]

interface DbWrapper {
  prepare(sql: string): {
    get(...args: unknown[]): Promise<Row>
    all(...args: unknown[]): Promise<RowArray>
    run(...args: unknown[]): Promise<{ changes: number; lastInsertRowid?: number }>
  }
  exec(sql: string): Promise<void>
  execMany(sqls: string[]): Promise<void>
  transaction<T>(fn: (...args: unknown[]) => T): (...args: unknown[]) => Promise<T>
  close(): void
  _reconnect?(): void
}

/* ─── Local better-sqlite3 wrapper ─── */

function createLocalDb(): DbWrapper {
  const Database = require('better-sqlite3')
  const fs = require('fs')
  const dbPath = process.env.VERCEL === "1" ? "/tmp/data.db" : path.join(process.cwd(), 'db', 'data.db')

  let d: any = null

  function open() {
    const dir = path.dirname(dbPath)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    d = new Database(dbPath)
    d.pragma('journal_mode = WAL')
    d.pragma('foreign_keys = ON')
  }

  open()

  return {
    prepare(sql: string) {
      const stmt = d.prepare(sql)
      return {
        get: (...args: unknown[]) => Promise.resolve(stmt.get(...args) as Row),
        all: (...args: unknown[]) => Promise.resolve(stmt.all(...args) as RowArray),
        run: (...args: unknown[]) => {
          const result = stmt.run(...args) as { changes: number; lastInsertRowid?: number }
          if (result.changes > 0) scheduleBlobSave()
          return Promise.resolve(result)
        },
      }
    },
    exec(sql: string) { d.exec(sql); return Promise.resolve() },
    execMany(sqls: string[]) {
      for (const s of sqls) d.exec(s)
      scheduleBlobSave()
      return Promise.resolve()
    },
    transaction<T>(fn: (...args: unknown[]) => T) {
      const txn = d.transaction(fn)
      return (...args: unknown[]) => {
        const result = txn(...args) as T
        scheduleBlobSave()
        return Promise.resolve(result)
      }
    },
    close() { if (d) { d.close(); d = null } },
    _reconnect() { if (d) d.close(); open() },
  }
}

/* ─── Turso remote wrapper ─── */

function createTursoDb(): DbWrapper {
  const { createClient } = require('@libsql/client/web')
  const client = createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  return {
    prepare(sql: string) {
      return {
        get: async (...args: unknown[]) => {
          const result = await client.execute({ sql, args })
          return (result.rows[0] || null) as Row
        },
        all: async (...args: unknown[]) => {
          const result = await client.execute({ sql, args })
          return result.rows as RowArray
        },
        run: async (...args: unknown[]) => {
          const result = await client.execute({ sql, args })
          return { changes: result.rowsAffected, lastInsertRowid: result.lastInsertRowid as number | undefined }
        },
      }
    },
    async exec(sql: string) { await client.execute({ sql }) },
    async execMany(sqls: string[]) {
      if (sqls.length === 0) return
      await client.batch(sqls.map(sql => ({ sql })))
    },
    transaction<T>(fn: (...args: unknown[]) => T) {
      return async (...args: unknown[]) => {
        await client.execute('BEGIN')
        try {
          const result = await fn(...args)
          await client.execute('COMMIT')
          return result as T
        } catch (e) {
          await client.execute('ROLLBACK')
          throw e
        }
      }
    },
    close() { /* no-op for remote */ },
  }
}

/* ─── Vercel Blob persistence ─── */

const BLOB_PATH_NAME = 'prime-trust-finance/data.db'
let blobStoreUrl: string | null = null
let blobSaveTimer: ReturnType<typeof setTimeout> | null = null
let blobDirty = false

async function initBlobStore(): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false
  try {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list()
    const existing = blobs.find(b => b.pathname === BLOB_PATH_NAME)
    if (existing) blobStoreUrl = existing.url
    return true
  } catch { return false }
}

async function loadDbFromBlob(fs: any): Promise<boolean> {
  if (!blobStoreUrl) return false
  try {
    const { get } = await import('@vercel/blob')
    const result = await get(blobStoreUrl, { access: 'public' })
    if (!result || !result.stream) return false
    const chunks: Buffer[] = []
    const reader = result.stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(Buffer.from(value))
    }
    const buffer = Buffer.concat(chunks)
    fs.writeFileSync('/tmp/data.db', buffer)
    return true
  } catch { return false }
}

async function saveDbToBlob(): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return
  try {
    const fs = require('fs')
    const dbPath = process.env.VERCEL === '1' ? '/tmp/data.db' : path.join(process.cwd(), 'db', 'data.db')
    if (!fs.existsSync(dbPath)) return
    const buffer = fs.readFileSync(dbPath)
    const { put } = await import('@vercel/blob')
    const result = await put(BLOB_PATH_NAME, buffer, { access: 'public', addRandomSuffix: false })
    blobStoreUrl = result.url
  } catch (e) {
    console.error('Blob save error:', e)
  }
}

function scheduleBlobSave(): void {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return
  blobDirty = true
  if (blobSaveTimer) return
  blobSaveTimer = setTimeout(async () => {
    blobSaveTimer = null
    if (blobDirty) {
      blobDirty = false
      await saveDbToBlob()
    }
  }, 2000)
}

/* ─── Schema & seed ─── */

const createTableStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT DEFAULT NULL,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS members (
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
  )`,
  `CREATE TABLE IF NOT EXISTS reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'default',
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT '',
    quote TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS news_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    image TEXT DEFAULT NULL,
    published INTEGER NOT NULL DEFAULT 0,
    date TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    suffix TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'default',
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo TEXT DEFAULT NULL,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS linked_accounts (
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
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
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
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON reset_tokens(token)`,
  `CREATE INDEX IF NOT EXISTS idx_reset_tokens_userId ON reset_tokens(userId)`,
]

async function columnExists(db: DbWrapper, table: string, column: string): Promise<boolean> {
  const rows = await db.prepare(`PRAGMA table_info(${table})`).all()
  return rows.some((r) => r.name === column)
}

async function migrateSchema(db: DbWrapper) {
  const migrates = [
    !(await columnExists(db, 'users', 'username')) ? "ALTER TABLE users ADD COLUMN username TEXT" : null,
    !(await columnExists(db, 'members', 'username')) ? "ALTER TABLE members ADD COLUMN username TEXT" : null,
    !(await columnExists(db, 'members', 'gender')) ? "ALTER TABLE members ADD COLUMN gender TEXT" : null,
    !(await columnExists(db, 'members', 'dateOfBirth')) ? "ALTER TABLE members ADD COLUMN dateOfBirth TEXT" : null,
    !(await columnExists(db, 'members', 'nationalId')) ? "ALTER TABLE members ADD COLUMN nationalId TEXT" : null,
    !(await columnExists(db, 'members', 'district')) ? "ALTER TABLE members ADD COLUMN district TEXT" : null,
    !(await columnExists(db, 'members', 'sector')) ? "ALTER TABLE members ADD COLUMN sector TEXT" : null,
    !(await columnExists(db, 'members', 'cell')) ? "ALTER TABLE members ADD COLUMN cell TEXT" : null,
    !(await columnExists(db, 'members', 'village')) ? "ALTER TABLE members ADD COLUMN village TEXT" : null,
    !(await columnExists(db, 'members', 'occupation')) ? "ALTER TABLE members ADD COLUMN occupation TEXT" : null,
    !(await columnExists(db, 'members', 'employer')) ? "ALTER TABLE members ADD COLUMN employer TEXT" : null,
    !(await columnExists(db, 'members', 'monthlyIncome')) ? "ALTER TABLE members ADD COLUMN monthlyIncome TEXT" : null,
    !(await columnExists(db, 'members', 'maritalStatus')) ? "ALTER TABLE members ADD COLUMN maritalStatus TEXT" : null,
    !(await columnExists(db, 'members', 'securityQuestion')) ? "ALTER TABLE members ADD COLUMN securityQuestion TEXT" : null,
    !(await columnExists(db, 'members', 'profilePhoto')) ? "ALTER TABLE members ADD COLUMN profilePhoto TEXT" : null,
    !(await columnExists(db, 'members', 'nationalIdDocument')) ? "ALTER TABLE members ADD COLUMN nationalIdDocument TEXT" : null,
  ].filter(Boolean) as string[]
  if (migrates.length > 0) await db.execMany(migrates)
  if (await columnExists(db, 'users', 'username')) {
    const users = await db.prepare("SELECT id, email, username FROM users").all() as { id: number; email: string; username: string | null }[]
    for (const user of users) {
      if (!user.username) {
        const base = user.email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase() || `member${user.id}`
        await db.prepare("UPDATE users SET username = ? WHERE id = ?").run(base, user.id)
      }
    }
  }
}

async function seedData(db: DbWrapper) {
  const row = await db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number } | undefined
  if (row && row.count > 0) return

  const adminHash = bcrypt.hashSync('admin123', 10)
  await db.prepare("INSERT OR IGNORE INTO users (email, username, passwordHash, role) VALUES (?, ?, ?, ?)").run('admin@ias.rw', 'admin', adminHash, 'admin')
  await db.prepare("INSERT OR IGNORE INTO users (email, username, passwordHash, role) VALUES (?, ?, ?, ?)").run('member@ias.rw', 'member', adminHash, 'user')

  const services = [
    ['Savings', 'Flexible savings accounts with competitive interest rates to help your money grow securely.', 'savings', 0],
    ['Loans', 'Affordable loan products with transparent terms and quick approval processes.', 'loans', 1],
    ['Emergency Support', 'Quick-access emergency funds when you need them most, with minimal paperwork.', 'emergency', 2],
    ['Investments', 'Smart investment opportunities designed to maximize returns for our members.', 'investments', 3],
    ['Digital Services', 'Modern digital banking platform for convenient account management anywhere, anytime.', 'digital', 4],
    ['Member Portal', 'Dedicated member portal with 24/7 access to your financial information and tools.', 'portal', 5],
  ]
  for (const s of services) await db.prepare("INSERT OR IGNORE INTO services (title, description, icon, sortOrder) VALUES (?, ?, ?, ?)").run(...s)

  const testimonials = [
    ['Jean-Pierre Habimana', 'Member since 2025', 'IAS helped me start my small business with an affordable loan. The process was smooth and the staff were incredibly supportive throughout.', 5, 0],
    ['Alice Mukamana', 'Member since 2024', "I've been saving with IAS and the interest rates are excellent. I trust them completely with my family's financial future.", 5, 1],
    ['David Niyonzima', 'Member since 2025', 'The emergency support fund was a lifesaver when my family needed urgent medical care. Quick approval and compassionate service. Highly recommended!', 5, 2],
    ['Grace Uwimana', 'Member since 2026', 'As a teacher, I needed a reliable savings plan. IAS offered the best terms and their digital platform makes managing my account so easy.', 4, 3],
  ]
  for (const t of testimonials) await db.prepare("INSERT INTO testimonials (name, role, quote, rating, sortOrder) VALUES (?, ?, ?, ?, ?)").run(...t)

  const newsItems = [
    ['IAS Launches New Digital Banking Platform', 'digital-banking-launch', 'Our new digital platform makes it easier than ever to manage your savings, apply for loans, and track your financial growth from anywhere.', '2026-03-15', 1],
    ['Annual Member Meeting: Record Growth in 2025', 'annual-meeting-2025', 'We reported a 25% increase in member savings and disbursed over 10 billion RWF in loans during our Annual General Meeting.', '2026-01-28', 1],
    ['New Savings Products with Competitive Interest Rates', 'new-savings-products', 'Introducing flexible savings plans designed to help members achieve their financial goals faster with enhanced interest rates.', '2025-12-05', 1],
  ]
  for (const n of newsItems) await db.prepare("INSERT OR IGNORE INTO news_items (title, slug, excerpt, date, published) VALUES (?, ?, ?, ?, ?)").run(...n)

  const statistics = [['Active Members', 20000, '+', 'users', 0], ['Member Savings', 45, 'B+ RWF', 'savings', 1], ['Loan Recovery', 98, '%', 'recovery', 2], ['Founded', 2026, '', 'calendar', 3]]
  for (const s of statistics) await db.prepare("INSERT OR IGNORE INTO statistics (label, value, suffix, icon, sortOrder) VALUES (?, ?, ?, ?, ?)").run(...s)

  const partners = ['Bank of Rwanda', 'Rwanda Cooperative Agency', 'Access Bank', 'Equity Bank', 'MTN Rwanda', 'Airtel Rwanda', 'RURA', 'RDB']
  for (let i = 0; i < partners.length; i++) await db.prepare("INSERT OR IGNORE INTO partners (name, sortOrder) VALUES (?, ?)").run(partners[i], i)

  const defaultSettings = [['bank_api_mode', 'simulation'], ['bank_api_base_url', ''], ['bank_api_client_id', ''], ['bank_api_client_secret', ''], ['bank_name', ''], ['ias_account_number', '4074200086837']]
  for (const [k, v] of defaultSettings) await db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run(k, v)
}

/* ─── Init ─── */

const globalForDb = globalThis as unknown as { db: DbWrapper }

async function initDbInternal(d: DbWrapper): Promise<DbWrapper> {
  const useTurso = !!(process.env.TURSO_DB_URL)
  const fs = require('fs')

  if (!useTurso && process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL === '1') {
    const blobAvailable = await initBlobStore()
    if (blobAvailable) {
      const loaded = await loadDbFromBlob(fs)
      if (loaded) {
        // Blob data written to /tmp/data.db — reopen connection to pick it up
        if (typeof d._reconnect === 'function') d._reconnect()
        return d
      }
      // First-ever startup — create fresh, seed, save to blob
      await d.execMany(createTableStatements)
      await migrateSchema(d)
      await seedData(d)
      await saveDbToBlob()
      return d
    }
  }

  await d.execMany(createTableStatements)
  await migrateSchema(d)
  await seedData(d)
  return d
}

// Set globalForDb.db IMMEDIATELY with initial connection (synchronous)
const initialDb = (() => {
  const useTurso = !!(process.env.TURSO_DB_URL)
  return useTurso ? createTursoDb() : createLocalDb()
})()
globalForDb.db = initialDb

// Async init runs in background — loads blob data, reconnects if needed
initDbInternal(initialDb).catch((e) => { console.error('DB init error:', e) })

// Proxy: always reads from globalForDb.db so updates after blob reload are reflected
export const db = new Proxy({} as DbWrapper, {
  get(_target, prop: string | symbol) {
    const d = globalForDb.db
    if (!d) throw new Error('Database not initialized')
    const value = (d as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === 'function' ? value.bind(d) : value
  },
})
