import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db.prepare("SELECT * FROM members WHERE email = ?").get(session.email) as Record<string, unknown> | undefined
  const memberId = member
    ? `IAS-${String(member.firstName || "").slice(0, 2).toUpperCase()}${String(member.lastName || "").slice(0, 2).toUpperCase()}-${(member.id as number).toString().padStart(4, "0")}`
    : `IAS-${session.id.toString().padStart(4, "0")}`
  const firstName = (member?.firstName as string) || session.username || "Member"
  const lastName = (member?.lastName as string) || ""
  const fullName = `${firstName} ${lastName}`.trim()
  const mid = member?.id as number | undefined

  const savingsAcct = mid ? await db.prepare("SELECT * FROM savings_accounts WHERE memberId = ?").get(mid) as Record<string, unknown> | undefined : undefined
  const savingsBalance = (savingsAcct?.balance as number) || 0
  const monthlyContributions = (savingsAcct?.monthlyContribution as number) || 0
  const interestEarned = (savingsAcct?.interestEarned as number) || 0
  const totalDeposits = (savingsAcct?.totalDeposits as number) || 0
  const totalWithdrawn = (savingsAcct?.totalWithdrawn as number) || 0

  const savingsTx = mid ? await db.prepare("SELECT * FROM savings_transactions WHERE accountId = (SELECT id FROM savings_accounts WHERE memberId = ?) ORDER BY createdAt DESC LIMIT 12").all(mid) as Record<string, unknown>[] : []
  const now = new Date()
  const savingsHistory = Array.isArray(savingsTx) && savingsTx.length > 0
    ? savingsTx.slice(0, 12).reverse().map((tx: Record<string, unknown>, i: number) => {
        const d = new Date(tx.createdAt as string)
        return { month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), amount: tx.balanceAfter as number || 0, contributions: tx.type === "deposit" ? tx.amount as number : 0 }
      })
    : Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
        const base = Math.max(1000, savingsBalance * (i + 1) / 12)
        return { month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), amount: Math.round(base), contributions: Math.round(base * 0.3) }
      })

  const goals = mid ? await db.prepare("SELECT * FROM savings_goals WHERE memberId = ? ORDER BY createdAt").all(mid) as Record<string, unknown>[] : []
  const mappedGoals = goals.map((g: Record<string, unknown>) => ({
    id: g.id, name: g.name, target: g.target, current: g.saved,
    expectedCompletion: g.deadline || "Ongoing",
  }))
  if (mappedGoals.length === 0) {
    mappedGoals.push(...[
      { id: 0, name: "Emergency Fund", target: 5000000, current: Math.round(savingsBalance * 0.3), expectedCompletion: "TBD" },
    ])
  }

  const loan = mid ? await db.prepare("SELECT * FROM loans WHERE memberId = ? AND status = 'active' ORDER BY disbursedAt DESC LIMIT 1").get(mid) as Record<string, unknown> | undefined : undefined
  const repayments = loan ? await db.prepare("SELECT * FROM loan_repayments WHERE loanId = ? ORDER BY year, month").all(loan.id) as Record<string, unknown>[] : []

  const loanData = loan ? {
    id: loan.id, amount: loan.amount, remainingBalance: loan.remainingBalance,
    monthlyInstallment: loan.monthlyPayment, interest: loan.interestRate,
    disbursementDate: loan.disbursedAt, dueDate: "",
    paidMonths: loan.paidMonths, totalMonths: loan.tenure, status: loan.status,
    paymentSchedule: repayments.map((r: Record<string, unknown>) => ({
      month: `${["January","February","March","April","May","June","July","August","September","October","November","December"][(r.month as number) - 1]} ${r.year}`,
      amount: r.amount, paid: r.paid, dueDate: r.dueDate,
    })),
  } : null

  const recentTransactions = mid
    ? await db.prepare("SELECT * FROM payments WHERE memberId = ? ORDER BY paidAt DESC LIMIT 10").all(mid) as Record<string, unknown>[]
    : []

  const notifications = mid
    ? await db.prepare("SELECT id, title, message, type, read, createdAt FROM notifications WHERE memberId = ? ORDER BY createdAt DESC LIMIT 5").all(mid) as Record<string, unknown>[]
    : []

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const currentMonth = monthNames[now.getMonth()]

  const income = Number(member?.monthlyIncome as string) || 0
  const repaymentScore = loan ? Math.round(((loan.paidMonths as number) / (loan.tenure as number)) * 100) : 100
  const savingRate = income > 0 ? Math.round((monthlyContributions / income) * 100) : 0

  return NextResponse.json({
    user: {
      id: session.id, email: session.email, username: session.username, role: session.role,
      firstName, lastName, fullName, memberId,
      phone: (member?.phone as string) || "", district: (member?.district as string) || "",
      occupation: (member?.occupation as string) || "", employer: (member?.employer as string) || "",
      monthlyIncome: income, profilePhoto: (member?.profilePhoto as string) || null,
      memberSince: (member?.memberSince as string) || "", verified: true,
    },
    savings: {
      balance: savingsBalance, monthlyContributions, interestEarned,
      growthRate: interestEarned > 0 && savingsBalance > 0 ? Math.round((interestEarned / (savingsBalance - interestEarned)) * 100 * 10) / 10 : 0,
      history: savingsHistory,
    },
    loan: loanData,
    creditScore: Math.min(100, Math.max(30, repaymentScore)),
    availableLoanLimit: mid
      ? (await db.prepare("SELECT COALESCE(SUM(amount), 0) as tot FROM loans WHERE memberId = ? AND status = 'active'").get(mid) as { tot: number }).tot
      : 0,
    recentTransactions: recentTransactions.map((t: Record<string, unknown>) => ({
      id: t.id, type: t.type === "deposit" ? "credit" : "debit", amount: t.amount,
      description: t.description, date: t.paidAt, status: t.status,
      category: t.type as string,
    })),
    goals: mappedGoals,
    notifications: notifications.map((n: Record<string, unknown>) => ({
      id: n.id, type: n.type, title: n.title, message: n.message, read: n.read, createdAt: n.createdAt,
    })),
    financialHealth: {
      savingHabit: savingRate >= 20 ? "Excellent — consistently saving above minimum" : savingRate >= 10 ? "Good — regular saver" : "Fair — consider increasing contributions",
      contributionConsistency: Math.min(100, savingRate * 5),
      repaymentScore,
      recommendedMaxLoan: Math.max(0, income * 12 - (loan?.remainingBalance as number || 0)),
      advice: "Based on your profile, continue maintaining regular savings to maximize your benefits.",
    },
    summary: {
      totalDepositsThisYear: totalDeposits,
      totalWithdrawalsThisYear: totalWithdrawn,
      loanRepaymentProgress: loan ? Math.round(((loan.paidMonths as number) / (loan.tenure as number)) * 100) : 0,
      nextContributionDate: `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, "0")}-01`,
      currentMonth,
    },
  })
}
