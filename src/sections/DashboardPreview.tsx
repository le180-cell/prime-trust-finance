"use client"

import { motion } from "framer-motion"
import { Bell, Search, LayoutDashboard, Wallet, Landmark, ArrowLeftRight, FileText, Settings, ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function DashboardPreview() {
  const { t } = useLanguage()

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Wallet, label: "Savings", active: false },
    { icon: Landmark, label: "Loans", active: false },
    { icon: ArrowLeftRight, label: "Transactions", active: false },
    { icon: FileText, label: "Statements", active: false },
    { icon: Settings, label: "Settings", active: false },
  ]

  const statCards = [
    { label: t.dashboardPreview.totalBalance, value: "RWF 2,450,000", change: "+12.5%", color: "from-secondary to-secondary-light" },
    { label: t.dashboardPreview.activeLoan, value: "RWF 800,000", change: "-5.2%", color: "from-primary to-primary-light" },
    { label: t.dashboardPreview.dividendsEarned, value: "RWF 124,500", change: "+8.3%", color: "from-accent to-accent-light" },
    { label: t.dashboardPreview.creditScore, value: "Excellent", change: "+15 pts", color: "from-secondary to-secondary-light" },
  ]

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" aria-label="Dashboard preview">
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-white to-white" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {t.dashboardPreview.badge}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">
            {t.dashboardPreview.title}
          </h2>
          <p className="mt-4 text-gray-600">
            {t.dashboardPreview.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}
          className="relative mx-auto max-w-6xl"
        >
          {/* Device frame */}
          <div className="relative overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_30px_80px_rgba(11,60,93,0.12),0_10px_30px_rgba(15,23,42,0.06)]">
            {/* Dashboard top bar */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-5 py-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#0E4F75] text-[9px] font-bold text-white shadow-sm">
                  IAS
                </div>
                <span className="text-xs font-bold text-gray-800">{t.dashboardPreview.memberPortal}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Search bar */}
                <div className="hidden items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 sm:flex">
                  <Search className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-400">{t.dashboardPreview.searchPlaceholder}</span>
                </div>
                {/* Notification bell */}
                <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                  <Bell className="h-3.5 w-3.5 text-gray-600" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-secondary text-[7px] font-bold text-white">
                    3
                  </span>
                </div>
                {/* Avatar */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary-light text-[9px] font-bold text-white shadow-sm">
                  JM
                </div>
              </div>
            </div>

            {/* Dashboard body */}
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden w-44 flex-shrink-0 border-r border-gray-100 bg-gray-50/50 p-3 sm:block">
                {sidebarItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                      item.active
                        ? "bg-gradient-to-r from-secondary/10 to-secondary/5 text-secondary shadow-sm"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${item.active ? "text-secondary" : "text-gray-400"}`} />
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 sm:p-6">
                {/* Header */}
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-gray-800">{t.dashboardPreview.welcomeBack}</h3>
                  <p className="text-xs text-gray-400">{t.dashboardPreview.financialSummary}</p>
                </div>

                {/* Stat cards grid */}
                <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <p className="text-[10px] font-medium text-gray-400">{card.label}</p>
                      <p className="mt-1 text-sm font-bold text-gray-800">{card.value}</p>
                      <span className={`text-[10px] font-semibold ${
                        card.change.startsWith("+") ? "text-secondary" : "text-red-500"
                      }`}>
                        {card.change}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom row: chart area + recent activity */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Chart area */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">{t.dashboardPreview.savingsGrowth}</span>
                      <span className="text-[10px] text-secondary font-medium">+8.2%</span>
                    </div>
                    {/* Mock chart bars */}
                    <div className="flex items-end gap-1.5 h-24">
                      {[35, 42, 38, 55, 48, 62, 58, 72, 68, 80, 75, 90].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t-md transition-all duration-300"
                            style={{
                              height: `${h}%`,
                              background: i === 11
                                ? "linear-gradient(to top, #16A34A, #22c55e)"
                                : "linear-gradient(to top, rgba(22,163,74,0.2), rgba(22,163,74,0.1))",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Month labels */}
                    <div className="mt-2 flex justify-between">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                        (m) => (
                          <span key={m} className="text-[8px] text-gray-400">{m}</span>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Recent activity */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">{t.dashboardPreview.recentActivity}</span>
                      <span className="text-[10px] text-secondary font-medium">{t.dashboardPreview.viewAll}</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { text: t.dashboardPreview.activityItems[0], amount: "+RWF 50,000", time: "2h ago" },
                        { text: t.dashboardPreview.activityItems[1], amount: "-RWF 25,000", time: "1d ago" },
                        { text: t.dashboardPreview.activityItems[2], amount: "+RWF 12,450", time: "3d ago" },
                        { text: t.dashboardPreview.activityItems[3], amount: "80%", time: "5d ago" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                          <div>
                            <p className="text-xs font-medium text-gray-700">{item.text}</p>
                            <p className="text-[10px] text-gray-400">{item.time}</p>
                          </div>
                          <span className={`text-xs font-semibold ${
                            item.amount.startsWith("+") ? "text-secondary" : "text-gray-700"
                          }`}>
                            {item.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow effect behind the mockup */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-3/4 bg-gradient-to-r from-transparent via-secondary/10 to-transparent blur-3xl" />
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
          className="mt-12 text-center"
        >
          <a
            href="/login"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-light px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-[0_8px_30px_rgba(11,60,93,0.3)] hover:-translate-y-1"
          >
            {t.dashboardPreview.exploreDashboard}
            <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
