import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const member = await db
    .prepare("SELECT * FROM members WHERE email = ?")
    .get(session.email) as Record<string, unknown> | undefined

  const memberId = member
    ? `IAS-${String(member.firstName || "").slice(0, 2).toUpperCase()}${String(member.lastName || "").slice(0, 2).toUpperCase()}-${(member.id as number).toString().padStart(4, "0")}`
    : `IAS-${session.id.toString().padStart(4, "0")}`

  const firstName = (member?.firstName as string) || session.username || "Member"
  const lastName = (member?.lastName as string) || ""
  const fullName = `${firstName} ${lastName}`.trim()

  const savingsBalance = 24800000
  const outstandingLoan = 8500000
  const monthlyIncome = 1200000
  const creditScore = 78

  const now = new Date()
  const savingsHistory = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    const base = 12000000 + i * 1100000 + Math.round(Math.random() * 400000)
    return {
      month: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      amount: base,
      contributions: Math.round(800000 + Math.random() * 400000),
    }
  })

  const goals = [
    { id: 1, name: "Emergency Fund", target: 5000000, current: 5000000, expectedCompletion: "Completed" },
    { id: 2, name: "Land Purchase", target: 15000000, current: 9800000, expectedCompletion: "Mar 2027" },
    { id: 3, name: "Education Fund", target: 8000000, current: 3200000, expectedCompletion: "Dec 2026" },
    { id: 4, name: "Business Capital", target: 20000000, current: 4500000, expectedCompletion: "Jun 2027" },
  ]

  const transactions = [
    { id: 1, type: "credit" as const, amount: 350000, description: "Monthly savings contribution", date: "2026-07-01", status: "completed" as const, category: "Savings" },
    { id: 2, type: "debit" as const, amount: 285000, description: "Loan installment payment", date: "2026-07-01", status: "completed" as const, category: "Loan" },
    { id: 3, type: "credit" as const, amount: 150000, description: "Interest earned on savings", date: "2026-06-30", status: "completed" as const, category: "Interest" },
    { id: 4, type: "credit" as const, amount: 500000, description: "Dividend payout Q2 2026", date: "2026-06-28", status: "completed" as const, category: "Dividend" },
    { id: 5, type: "debit" as const, amount: 75000, description: "Insurance premium deduction", date: "2026-06-25", status: "completed" as const, category: "Insurance" },
    { id: 6, type: "credit" as const, amount: 200000, description: "Savings top-up", date: "2026-06-20", status: "completed" as const, category: "Savings" },
    { id: 7, type: "credit" as const, amount: 350000, description: "Monthly savings contribution", date: "2026-06-01", status: "completed" as const, category: "Savings" },
    { id: 8, type: "debit" as const, amount: 285000, description: "Loan installment payment", date: "2026-06-01", status: "completed" as const, category: "Loan" },
    { id: 9, type: "credit" as const, amount: 1200000, description: "Salary deposit", date: "2026-05-28", status: "completed" as const, category: "Income" },
    { id: 10, type: "debit" as const, amount: 50000, description: "Membership fee deduction", date: "2026-05-15", status: "completed" as const, category: "Fee" },
  ]

  const loanPaymentSchedule = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return {
      month: d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      amount: 285000,
      paid: i < 4,
      dueDate: d.toISOString().split("T")[0],
    }
  })

  const notifications = [
    { id: 1, type: "payment" as const, title: "Loan payment received", message: "Your July installment of RWF 285,000 was processed.", read: false, createdAt: "2026-07-01T08:00:00Z" },
    { id: 2, type: "savings" as const, title: "Savings milestone", message: "Congratulations! You've reached RWF 24,800,000 in total savings.", read: false, createdAt: "2026-06-30T10:00:00Z" },
    { id: 3, type: "dividend" as const, title: "Dividend credited", message: "Q2 2026 dividend of RWF 500,000 has been credited to your account.", read: true, createdAt: "2026-06-28T14:00:00Z" },
    { id: 4, type: "alert" as const, title: "Contribution reminder", message: "Your monthly contribution of RWF 350,000 is due in 3 days.", read: true, createdAt: "2026-06-27T09:00:00Z" },
    { id: 5, type: "payment" as const, title: "Loan approval", message: "Your loan application for RWF 10,000,000 has been approved.", read: true, createdAt: "2026-06-20T11:00:00Z" },
  ]

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const currentMonth = monthNames[now.getMonth()]

  return NextResponse.json({
    user: {
      id: session.id,
      email: session.email,
      username: session.username,
      role: session.role,
      firstName,
      lastName,
      fullName,
      memberId,
      phone: (member?.phone as string) || "+250 788 123 456",
      district: (member?.district as string) || "Kigali",
      occupation: (member?.occupation as string) || "Member",
      employer: (member?.employer as string) || "Self-employed",
      monthlyIncome,
      profilePhoto: (member?.profilePhoto as string) || null,
      memberSince: (member?.memberSince as string) || "2023-01-15",
      verified: true,
    },
    savings: {
      balance: savingsBalance,
      monthlyContributions: 350000,
      interestEarned: 1850000,
      growthRate: 12.4,
      history: savingsHistory,
    },
    loan: {
      amount: 10000000,
      remainingBalance: outstandingLoan,
      monthlyInstallment: 285000,
      interest: 12.5,
      disbursementDate: "2026-03-01",
      dueDate: "2029-03-01",
      paidMonths: 4,
      totalMonths: 36,
      status: "active" as const,
      paymentSchedule: loanPaymentSchedule,
    },
    creditScore,
    availableLoanLimit: Math.max(0, 50000000 - outstandingLoan),
    recentTransactions: transactions,
    goals,
    notifications,
    financialHealth: {
      savingHabit: "Excellent — consistently saving above minimum",
      contributionConsistency: 94,
      repaymentScore: 88,
      recommendedMaxLoan: 18000000,
      advice: "Based on your income and savings pattern, you qualify for an increased loan limit. Consider applying for a development loan to fund your land purchase goal.",
    },
    summary: {
      totalDepositsThisYear: 4200000,
      totalWithdrawalsThisYear: 1140000,
      loanRepaymentProgress: 15.8,
      nextContributionDate: `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, "0")}-01`,
      currentMonth: currentMonth,
    },
  })
}
