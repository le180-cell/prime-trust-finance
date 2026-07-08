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
  `CREATE TABLE IF NOT EXISTS cms_content (
    section TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (section, key)
  )`,
  `CREATE TABLE IF NOT EXISTS faq_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS loan_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    minAmount REAL NOT NULL DEFAULT 0,
    maxAmount REAL NOT NULL DEFAULT 0,
    interestRate REAL NOT NULL DEFAULT 12,
    minTenure INTEGER NOT NULL DEFAULT 1,
    maxTenure INTEGER NOT NULL DEFAULT 60,
    icon TEXT NOT NULL DEFAULT 'default',
    active INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS loan_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    amount REAL NOT NULL,
    tenure INTEGER NOT NULL,
    purpose TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    interestRate REAL NOT NULL DEFAULT 12,
    monthlyPayment REAL NOT NULL DEFAULT 0,
    totalInterest REAL NOT NULL DEFAULT 0,
    totalRepayment REAL NOT NULL DEFAULT 0,
    appliedAt TEXT NOT NULL DEFAULT (datetime('now')),
    reviewedAt TEXT DEFAULT NULL,
    reviewedBy INTEGER DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    FOREIGN KEY (memberId) REFERENCES members(id),
    FOREIGN KEY (productId) REFERENCES loan_products(id)
  )`,
  `CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    applicationId INTEGER DEFAULT NULL,
    amount REAL NOT NULL,
    interestRate REAL NOT NULL DEFAULT 12,
    tenure INTEGER NOT NULL DEFAULT 12,
    monthlyPayment REAL NOT NULL DEFAULT 0,
    totalInterest REAL NOT NULL DEFAULT 0,
    totalRepayment REAL NOT NULL DEFAULT 0,
    paidMonths INTEGER NOT NULL DEFAULT 0,
    remainingBalance REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    disbursedAt TEXT NOT NULL DEFAULT (datetime('now')),
    completedAt TEXT DEFAULT NULL,
    FOREIGN KEY (memberId) REFERENCES members(id),
    FOREIGN KEY (applicationId) REFERENCES loan_applications(id)
  )`,
  `CREATE TABLE IF NOT EXISTS loan_repayments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loanId INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    dueDate TEXT NOT NULL,
    amount REAL NOT NULL,
    paid INTEGER NOT NULL DEFAULT 0,
    paidDate TEXT DEFAULT NULL,
    FOREIGN KEY (loanId) REFERENCES loans(id)
  )`,
  `CREATE TABLE IF NOT EXISTS savings_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    balance REAL NOT NULL DEFAULT 0,
    interestRate REAL NOT NULL DEFAULT 4.5,
    monthlyContribution REAL NOT NULL DEFAULT 0,
    totalDeposits REAL NOT NULL DEFAULT 0,
    totalWithdrawn REAL NOT NULL DEFAULT 0,
    interestEarned REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    openedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (memberId) REFERENCES members(id)
  )`,
  `CREATE TABLE IF NOT EXISTS savings_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    accountId INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    balanceBefore REAL NOT NULL DEFAULT 0,
    balanceAfter REAL NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (accountId) REFERENCES savings_accounts(id)
  )`,
  `CREATE TABLE IF NOT EXISTS savings_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    name TEXT NOT NULL,
    target REAL NOT NULL,
    saved REAL NOT NULL DEFAULT 0,
    deadline TEXT DEFAULT NULL,
    icon TEXT NOT NULL DEFAULT 'target',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (memberId) REFERENCES members(id)
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    reference TEXT DEFAULT NULL,
    method TEXT NOT NULL DEFAULT 'mobile',
    status TEXT NOT NULL DEFAULT 'completed',
    paidAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (memberId) REFERENCES members(id)
  )`,
  `CREATE TABLE IF NOT EXISTS receivables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    dueDate TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    description TEXT DEFAULT NULL,
    reference TEXT DEFAULT NULL,
    paidAt TEXT DEFAULT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (memberId) REFERENCES members(id)
  )`,
  `CREATE TABLE IF NOT EXISTS penalties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    description TEXT NOT NULL,
    reason TEXT DEFAULT NULL,
    amount REAL NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'pending',
    imposedDate TEXT NOT NULL DEFAULT (datetime('now')),
    dueDate TEXT NOT NULL,
    paidDate TEXT DEFAULT NULL,
    FOREIGN KEY (memberId) REFERENCES members(id)
  )`,
  `CREATE TABLE IF NOT EXISTS interest_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rate REAL NOT NULL,
    type TEXT NOT NULL DEFAULT 'savings',
    minBalance REAL NOT NULL DEFAULT 0,
    maxBalance REAL NOT NULL DEFAULT 999999999,
    active INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT 'info',
    read INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (memberId) REFERENCES members(id)
  )`,
  `CREATE TABLE IF NOT EXISTS member_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    action TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'general',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (memberId) REFERENCES members(id)
  )`,
  `CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    lastUpdate TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (memberId) REFERENCES members(id)
  )`,
  `CREATE TABLE IF NOT EXISTS calendar_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memberId INTEGER NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT DEFAULT NULL,
    type TEXT NOT NULL DEFAULT 'reminder',
    amount REAL DEFAULT NULL,
    description TEXT DEFAULT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (memberId) REFERENCES members(id)
  )`,
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    adminId INTEGER NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entityId INTEGER DEFAULT NULL,
    details TEXT DEFAULT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (adminId) REFERENCES users(id)
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

  // Seed CMS content
  const cmsDefaults = [
    ['hero', 'title', 'Prime Trust Finance'],
    ['hero', 'subtitle', 'Empowering Financial Growth, Building Trust'],
    ['hero', 'description', 'Join Rwanda\'s most trusted savings and loan cooperative. Secure your future with flexible savings, affordable loans, and dedicated member support.'],
    ['hero', 'cta', 'Get Started'],
    ['hero', 'ctaSecondary', 'Learn More'],
    ['about', 'title', 'About IAS'],
    ['about', 'content', 'IAS (Ikibazo cy\'Abakozi ba Amasezerano) is a member-owned financial cooperative dedicated to promoting savings and providing affordable credit to its members. Established with the mission of financial inclusion, we serve thousands of members across Rwanda.'],
    ['about', 'mission', 'To provide accessible, affordable, and sustainable financial services that empower our members to achieve their goals.'],
    ['about', 'vision', 'To be the leading member-centric financial cooperative in Rwanda, setting the standard for trust, innovation, and community impact.'],
    ['contact', 'address', 'KG 123 St, Kigali, Rwanda'],
    ['contact', 'phone', '+250 788 000 000'],
    ['contact', 'email', 'info@ias.rw'],
    ['contact', 'hours', 'Mon-Fri: 8:00 AM - 5:00 PM'],
    ['social', 'facebook', 'https://facebook.com/ias'],
    ['social', 'twitter', 'https://twitter.com/ias'],
    ['social', 'instagram', 'https://instagram.com/ias'],
    ['social', 'linkedin', 'https://linkedin.com/company/ias'],
    ['footer', 'copyright', `© ${new Date().getFullYear()} IAS - Ikibazo cy\'Abakozi ba Amasezerano. All rights reserved.`],
    ['footer', 'tagline', 'Building financial futures together.'],
  ]
  for (const [section, key, value] of cmsDefaults) await db.prepare("INSERT OR IGNORE INTO cms_content (section, key, value) VALUES (?, ?, ?)").run(section, key, value)

  // Seed FAQ
  const faqs = [
    ['How do I apply for a loan?', 'You can apply for a loan through your member dashboard. Navigate to "Loan Applications", select a loan product, fill in the required details, and submit. Our team will review your application within 2-3 business days.', 0],
    ['When are dividends paid?', 'Dividends are calculated annually based on your average savings balance and the cooperative\'s profitability. They are typically credited to member accounts at the end of each financial year.', 1],
    ['What are the current interest rates?', 'Savings accounts earn competitive interest rates starting from 4.5% per annum. Loan interest rates vary by product, starting from 9% APR. Check our Loans page for current rates.', 2],
    ['How can I update my profile?', 'You can update your personal information through the Profile page in your member dashboard. Changes to critical information may require verification.', 3],
    ['Can I have multiple loans at once?', 'IAS allows one active loan at a time per member. You must fully repay your current loan before applying for a new one, unless you qualify for a top-up.', 4],
    ['What documents do I need to join?', 'To join IAS, you need a valid government-issued ID, passport photos, and proof of residence. The registration process is straightforward and can be completed online.', 5],
  ]
  for (const [q, a, order] of faqs) await db.prepare("INSERT OR IGNORE INTO faq_items (question, answer, sortOrder) VALUES (?, ?, ?)").run(q, a, order)

  // Seed loan products
  const loanProducts = [
    ['Development Loan', 'Long-term financing for business expansion, asset acquisition, or major projects.', 100000, 50000000, 9, 6, 60, 'briefcase', 1],
    ['Emergency Loan', 'Quick-access funds for urgent needs like medical expenses or emergencies.', 50000, 2000000, 15, 1, 12, 'ambulance', 1],
    ['Education Loan', 'Financing for tuition, school fees, and educational materials.', 100000, 10000000, 10, 3, 36, 'graduation-cap', 1],
    ['Agriculture Loan', 'Seasonal financing for farming inputs, equipment, and agricultural projects.', 100000, 15000000, 12, 3, 48, 'sprout', 1],
  ]
  for (const [name, desc, minAmt, maxAmt, rate, minTen, maxTen, icon, active] of loanProducts) await db.prepare("INSERT OR IGNORE INTO loan_products (name, description, minAmount, maxAmount, interestRate, minTenure, maxTenure, icon, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(name, desc, minAmt, maxAmt, rate, minTen, maxTen, icon, active)

  // Seed interest policies
  const policies = [
    ['Regular Savings', 4.5, 'savings', 0, 999999999, 1],
    ['Premium Savings', 6.0, 'savings', 5000000, 999999999, 1],
    ['Loan Interest Standard', 12.0, 'loan', 0, 999999999, 1],
  ]
  for (const [name, rate, type, minBal, maxBal, active] of policies) await db.prepare("INSERT OR IGNORE INTO interest_policies (name, rate, type, minBalance, maxBalance, active) VALUES (?, ?, ?, ?, ?, ?)").run(name, rate, type, minBal, maxBal, active)
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
