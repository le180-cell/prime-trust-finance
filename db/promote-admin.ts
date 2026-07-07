import Database from "better-sqlite3"
import path from "path"

const email = process.argv[2]
if (!email) {
  console.error("Usage: npx tsx db/promote-admin.ts <email>")
  process.exit(1)
}

const db = new Database(path.join(__dirname, "data.db"))
const result = db.prepare("UPDATE users SET role = 'admin' WHERE email = ?").run(email)

if (result.changes > 0) {
  console.log(`User ${email} is now an admin. Log out and log back in for the change to take effect.`)
} else {
  console.error(`No user found with email: ${email}`)
}
db.close()
