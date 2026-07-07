"use client"

import { useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/admin/sidebar"
import Topnav from "@/components/admin/topnav"
import BottomNav from "@/components/admin/BottomNav"
import CommandPalette from "@/components/admin/command-palette"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) router.push("/login")
        else if (data.user.role !== "admin") router.push("/dashboard")
      })
      .catch(() => {})
  }, [router])

  const marginLeft = isDesktop ? (sidebarCollapsed ? 72 : 260) : 0
  const contentPadding = isDesktop ? "pt-16 pb-6" : "pt-12 pb-16"

  return (
    <div className="admin-body flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div
        className="flex flex-1 flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft }}
      >
        <Topnav
          onSearchOpen={() => setCommandOpen(true)}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className={`flex-1 px-2 sm:px-4 lg:px-6 ${contentPadding} max-w-full overflow-x-hidden`}>
          {children}
        </main>
      </div>

      <BottomNav />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
