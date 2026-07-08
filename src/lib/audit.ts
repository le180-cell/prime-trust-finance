import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function logAudit(action: string, entity: string, entityId?: number, details?: string) {
  try {
    const session = await getSession()
    if (!session) return
    await db.prepare(
      "INSERT INTO audit_logs (adminId, action, entity, entityId, details) VALUES (?, ?, ?, ?, ?)"
    ).run(session.id, action, entity, entityId || null, details || null)
  } catch {
    // silent fail for audit logging
  }
}
