"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PiggyBank, Landmark, ShieldAlert, TrendingUp, Smartphone, Users, ArrowUpRight } from "lucide-react"
import type { Service } from "@/types"
import { useLanguage } from "@/contexts/LanguageContext"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  savings: PiggyBank,
  loans: Landmark,
  emergency: ShieldAlert,
  investments: TrendingUp,
  digital: Smartphone,
  portal: Users,
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0, 1] as const },
  }),
}

function ServiceCard({ service, index, t }: { service: Service; index: number; t: any }) {
  const Icon: React.ComponentType<{ className?: string }> = iconMap[service.icon] || PiggyBank

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-secondary/5 blur-2xl transition-all duration-500 group-hover:bg-secondary/10" />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30" />

      <div className="relative z-10">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 transition-all duration-500 group-hover:from-primary/20 group-hover:to-secondary/20 group-hover:shadow-lg group-hover:shadow-primary/20">
          <Icon className="h-7 w-7 text-primary transition-all duration-500 group-hover:scale-110" />
        </div>
        <h3 className="font-heading text-xl font-semibold text-primary">{service.title}</h3>
        <p className="mt-3 leading-relaxed text-gray-600">{service.description}</p>
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-secondary opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span>{t.services.learnMore}</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </motion.div>
  )
}

export default function Services() {
  const { t } = useLanguage()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => { setServices(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section id="services" className="relative py-24 sm:py-32" aria-label="Our services">
      <div id="savings" className="absolute -top-20 left-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-surface/50 to-white" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(22,163,74,0.03),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {t.services.badge}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">
            {t.services.title}
          </h2>
          <p className="mt-4 text-gray-600">
            {t.services.description}
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
              ))
            : services.map((service, i) => (
                <ServiceCard key={service.title} service={service} index={i} t={t} />
              ))}
        </div>
      </div>
    </section>
  )
}
