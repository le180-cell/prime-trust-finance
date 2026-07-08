"use client"

import { useMemo, useState, useEffect, type ComponentType } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, ArrowRight, PiggyBank, Landmark, Wallet, TrendingUp, Shield, Coins, LayoutDashboard, BarChart3 } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

type FloatingItem = { Icon: ComponentType<{ className?: string }>; label: string; x: string; y: string; delay: number; size: number; color: string }

const floatingElements: FloatingItem[] = [
  { Icon: PiggyBank, label: "Savings", x: "5%", y: "15%", delay: 0, size: 44, color: "from-emerald-400 to-emerald-600" },
  { Icon: Landmark, label: "Loans", x: "72%", y: "10%", delay: 0.4, size: 40, color: "from-blue-400 to-blue-600" },
  { Icon: Wallet, label: "Wallet", x: "80%", y: "55%", delay: 0.8, size: 38, color: "from-amber-400 to-amber-600" },
  { Icon: Shield, label: "Security", x: "8%", y: "65%", delay: 1.2, size: 42, color: "from-cyan-400 to-cyan-600" },
  { Icon: Coins, label: "Coins", x: "55%", y: "8%", delay: 0.6, size: 36, color: "from-yellow-400 to-yellow-600" },
  { Icon: TrendingUp, label: "Growth", x: "2%", y: "40%", delay: 1, size: 40, color: "from-green-400 to-green-600" },
  { Icon: LayoutDashboard, label: "Dashboard", x: "68%", y: "75%", delay: 1.4, size: 44, color: "from-violet-400 to-violet-600" },
  { Icon: BarChart3, label: "Analytics", x: "40%", y: "82%", delay: 0.5, size: 36, color: "from-rose-400 to-rose-600" },
]

const defaultStats: { label: string; value: string; change: string; positive: boolean }[] = [
  { label: "Total Savings", value: "RWF 2.4B", change: "+12.5%", positive: true },
  { label: "Active Loans", value: "RWF 1.8B", change: "-5.2%", positive: false },
  { label: "Dividends", value: "RWF 124M", change: "+8.3%", positive: true },
  { label: "Members", value: "20,000+", change: "+15%", positive: true },
]

const trustItems = ["Secure Savings", "Affordable Loans", "Transparent Management", "Trusted by Members"]

function CentralDashboard({ stats: staticStats }: { stats: typeof defaultStats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 1.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-xs font-bold text-accent">IAS</div>
          <span className="text-xs font-semibold text-white/80">Member Dashboard</span>
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[9px] text-white/50">•••</div>
      </div>
      <div className="mb-4 rounded-2xl bg-white/5 p-4">
        <p className="text-[10px] uppercase tracking-wider text-white/40">Total Portfolio Value</p>
        <p className="mt-1 font-heading text-2xl font-bold text-white">{staticStats[0]?.value || "RWF 4.2B"}</p>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={`rounded-full px-2 py-0.5 ${staticStats[0]?.positive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{staticStats[0]?.change || "+8.7%"}</span>
          <span className="text-white/40">vs last year</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {staticStats.slice(1).map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 + i * 0.1, duration: 0.5 }}
            className="rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:bg-white/10"
          >
            <p className="text-[10px] text-white/40">{item.label}</p>
            <p className="mt-0.5 text-sm font-bold text-white">{item.value}</p>
            <p className={`text-[10px] ${item.positive ? "text-emerald-400" : "text-red-400"}`}>{item.change}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function FloatingIcon({ Icon, label, x, y, delay, size, color }: FloatingItem) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2.2 + delay, duration: 0.6, ease: "backOut" }}
      className="absolute z-10"
      style={{ left: x, top: y }}
    >
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
        className="group relative"
      >
        <div className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${color} p-2.5 shadow-lg transition-all hover:scale-110`}
          style={{ width: size, height: size }}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-primary shadow-md"
        >
          {label}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function ParticleField() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const particles = useMemo(() =>
    Array.from({ length: 30 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 8 + 6,
      opacity: Math.random() * 0.3 + 0.1,
    }))
  , [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -30, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}
    </div>
  )
}

function formatStat(value: number, suffix: string): string {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B${suffix ? " " + suffix : ""}`
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${suffix ? " " + suffix : ""}`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K${suffix ? " " + suffix : ""}`
  return `${value}${suffix ? " " + suffix : ""}`
}

export default function Hero() {
  const { t } = useLanguage()
  const [statValues, setStatValues] = useState(defaultStats)
  useEffect(() => {
    fetch("/api/statistics")
      .then(r => r.json())
      .then((data: { label: string; value: number; suffix: string }[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const total = data.reduce((s, d) => s + d.value, 0)
          setStatValues([
            { label: "Portfolio", value: formatStat(total, ""), change: `+${Math.round((total * 0.08) / 1000)}%`, positive: true },
            ...data.map((d, i) => ({
              label: d.label,
              value: formatStat(d.value, d.suffix),
              change: i % 2 === 0 ? `+${Math.round(Math.random() * 10 + 5)}%` : `${Math.round(Math.random() * -10 - 2)}%`,
              positive: i % 2 === 0,
            })),
          ])
        }
      })
      .catch(() => {})
  }, [])
  return (
    <section id="home" className="relative min-h-screen" aria-label="Hero section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#0a2e48] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(22,163,74,0.12),transparent_50%)] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(244,180,0,0.06),transparent_50%)] z-0" />

      {/* Glowing blobs */}
      <div className="absolute top-[15%] left-[10%] h-64 w-64 rounded-full bg-secondary/10 blur-[80px] animate-pulse z-0" />
      <div className="absolute bottom-[20%] right-[15%] h-80 w-80 rounded-full bg-accent/8 blur-[100px] animate-pulse z-0" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[40%] right-[30%] h-40 w-40 rounded-full bg-primary-light/15 blur-[60px] animate-pulse z-0" style={{ animationDelay: "4s" }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] z-0" />

      {/* Particles */}
      <ParticleField />

      {/* Main content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 flex-col items-center gap-8 pt-28 pb-12 sm:pt-32 lg:flex-row lg:pt-36">
          {/* LEFT */}
          <div className="flex flex-1 flex-col justify-center text-center lg:text-left">
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-heading text-2xl font-bold leading-[1.1] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-[3rem]"
              >
                {t.hero.heading[0]}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-heading text-2xl font-bold leading-[1.1] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-[3rem]"
              >
                {t.hero.heading[1]}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-heading text-2xl font-bold leading-[1.1] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[2.5rem] xl:text-[3rem]"
              >
                {t.hero.heading[2]}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
                className="pt-4 text-xl font-bold tracking-[0.2em] text-accent sm:text-2xl lg:text-3xl"
              >
                {t.hero.abbreviation}
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="mx-auto mt-10 max-w-lg text-xs leading-relaxed text-white/60 sm:text-sm lg:mx-0"
            >
              {t.hero.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-12 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
            >
              <a
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-xs font-bold text-primary transition-all hover:bg-accent-light hover:shadow-[0_8px_30px_rgba(244,180,0,0.3)] sm:px-7 sm:py-3 sm:text-sm"
              >
                {t.hero.primaryBtn}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-2.5 text-xs font-semibold text-white/80 transition-all hover:border-white/50 hover:text-white sm:px-7 sm:py-3 sm:text-sm"
              >
                {t.hero.secondaryBtn}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.6 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] text-white/45 sm:justify-start sm:text-xs"
            >
              {t.hero.trust.map((item, i) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 2.8 + i * 0.15, ease: "easeOut" }}
                  className="flex items-center gap-2"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="relative hidden flex-1 items-center justify-center lg:flex">
            <div className="relative h-[520px] w-full max-w-lg">
              <CentralDashboard stats={statValues} />

              {floatingElements.map((el) => (
                <FloatingIcon key={el.label} Icon={el.Icon} label={el.label} x={el.x} y={el.y} delay={el.delay} size={el.size} color={el.color} />
              ))}

              {/* Orbital ring */}
              <motion.div
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 0.15, rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 2 }}
                className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/10"
              />
              <motion.div
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 0.1, rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear", delay: 2 }}
                className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/8"
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 0.8 }}
          className="flex flex-col items-center gap-2 pb-8"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-white/25"
          >
            <motion.div
              animate={{ y: [2, 12, 2] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="mt-1.5 h-2 w-1 rounded-full bg-accent"
            />
          </motion.div>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/35">{t.hero.scrollText}</span>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
    </section>
  )
}
