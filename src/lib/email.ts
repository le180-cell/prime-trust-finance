import nodemailer from "nodemailer"

const smtpHost = process.env.SMTP_HOST || ""
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10)
const smtpUser = process.env.SMTP_USER || ""
const smtpPass = process.env.SMTP_PASS || ""
const fromAddress = process.env.SMTP_FROM || "noreply@ias.rw"

function createTransporter() {
  if (!smtpHost) return null
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
  })
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
): Promise<boolean> {
  const transporter = createTransporter()
  if (!transporter) return false

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "Reset your IAS account password",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
<h2 style="color:#0B3C5D">IAS Password Reset</h2>
<p>Click the link below to reset your password. This link expires in 1 hour.</p>
<a href="${resetLink}" style="display:inline-block;background:#0B3C5D;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;margin:16px 0">Reset Password</a>
<p style="color:#666;font-size:14px">If you didn't request this, you can ignore this email.</p>
</div>`,
    })
    return true
  } catch {
    return false
  }
}
