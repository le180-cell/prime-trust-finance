"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Users, DollarSign, TrendingUp, Calendar } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface StatData {
  id: number
  label: string
  value: number
  suffix: string
  icon: string
  sortOrder: number
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  users: Users,
  savings: DollarSign,
  recovery: TrendingUp,
  calendar: Calendar,
}

const gradients = [
  "from-blue-500/10 via-blue-500/5 to-transparent",
  "from-emerald-500/10 via-emerald-500/5 to-transparent",
  "from-amber-500/10 via-amber-500/5 to-transparent",
  "from-violet-500/10 via-violet-500/5 to-transparent",
]

const iconBgGradients = [
  "from-blue-500/20 to-blue-600/10",
  "from-emerald-500/20 to-emerald-600/10",
  "from-amber-500/20 to-amber-600/10",
  "from-violet-500/20 to-violet-600/10",
]

const iconColors = [
  "text-blue-600",
  "text-emerald-600",
  "text-amber-600",
  "text-violet-600",
]

function StatCard({ stat, index }: { stat: StatData; index: number }) {
  const countRef = useRef<HTMLSpanElement>(null)
  const Icon = iconMap[stat.icon] || Users

  useEffect(() => {
    const el = countRef.current
    if (!el) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        onEnter: () => {
          gsap.fromTo(
            el,
            { textContent: 0 },
            {
              textContent: stat.value,
              duration: 2.5,
              ease: "power3.out",
              snap: { textContent: 1 },
              onUpdate: () => {
                const val = Math.round(Number(el.textContent))
                el.textContent = val.toLocaleString()
              },
            }
          )
        },
        once: true,
      })
    })

    return () => ctx.revert()
  }, [stat.value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.1, 0, 1] as const }}
      className="group relative rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradients[index]} opacity-60 transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30" />
      <div className="relative z-10">
        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${iconBgGradients[index]}`}>
          <Icon className={`h-7 w-7 ${iconColors[index]}`} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-heading text-4xl font-bold text-primary sm:text-5xl">
            <span ref={countRef}>0</span>
            {stat.suffix}
          </span>
        </div>
        <p className="mt-2 text-base text-gray-600">{stat.label}</p>
      </div>
    </motion.div>
  )
}

export default function Statistics() {
  const { t } = useLanguage()
  const [stats, setStats] = useState<StatData[]>([])

  useEffect(() => {
    fetch("/api/statistics")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
  }, [])

  return (
    <section id="about" className="relative py-24 sm:py-32" aria-label="Trust statistics">
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t.stats.badge}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">
            {t.stats.title}
          </h2>
          <p className="mt-4 text-gray-600">
            {t.stats.description}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.length > 0
            ? stats.map((stat, i) => (
                <StatCard key={stat.label} stat={stat} index={i} />
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />
              ))}
        </div>
      </div>
    </section>
  )
}
