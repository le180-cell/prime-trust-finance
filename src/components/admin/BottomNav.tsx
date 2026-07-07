"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CreditCard, BarChart3, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "More", icon: MoreHorizontal },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-gray-100 bg-white/95 backdrop-blur-xl px-2 dark:border-white/5 dark:bg-slate-900/95 lg:hidden safe-area-bottom">
      {items.map((item) => {
        const Icon = item.icon
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-all active:scale-95 min-w-0",
              active
                ? "text-primary dark:text-secondary"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <div className={cn(
              "flex h-6 w-6 items-center justify-center rounded-lg transition-all",
              active && "bg-primary/10 dark:bg-secondary/10"
            )}>
              <Icon className={cn("h-5 w-5", active && "scale-110")} />
            </div>
            <span className={cn(
              "text-[10px] font-semibold leading-none",
              active ? "opacity-100" : "opacity-80"
            )}>
              {item.label}
            </span>
            {active && (
              <span className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary dark:bg-secondary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
