"use client"

import { type ReactNode } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { ShieldCheck, Lock, Landmark, PiggyBank, FileText } from "lucide-react"

const AuthScene = dynamic(() => import("./AuthScene"), {
  ssr: false,
  loading: () => null,
})

type Stat = {
  value: number
  suffix: string
  label: string
}

type Feature = {
  label: string
}

type AuthShellProps = {
  badge: string
  title: ReactNode
  subtitle: ReactNode
  features: Feature[]
  stats: Stat[]
  panelClassName?: string
  children: ReactNode
}

const featureIcons = [Lock, Landmark, PiggyBank, FileText]

export default function AuthShell({ badge, title, subtitle, features, stats, panelClassName = "max-w-[480px]", children }: AuthShellProps) {
  return (
    <main className="auth-shell relative min-h-screen text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#0a2e48]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.15),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.1),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_50%,rgba(255,255,255,0.05))]" />

      <div className="hidden lg:block">
        <AuthScene />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <section className="relative flex min-h-[48vh] flex-[1.15] items-center px-6 py-10 sm:px-10 lg:min-h-screen lg:px-12 xl:px-16">
          <div className="relative z-10 flex w-full flex-col justify-center text-white lg:pr-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
                  IAS
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                  IKIMINA ABANYAMURYANGO SOLIDARITY
                </p>
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">
                <ShieldCheck className="h-3 w-3 text-accent" />
                {badge}
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="font-heading text-[34px] font-bold leading-[1.1] tracking-tight sm:text-[42px] lg:text-[50px] xl:text-[56px]"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="mt-6 max-w-md text-sm leading-relaxed text-white/60 sm:text-base"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="mt-10 space-y-3"
            >
              {features.map((feature, i) => {
                const Icon = featureIcons[i] || ShieldCheck
                return (
                  <div key={feature.label} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                      <Icon className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <span className="text-sm text-white/70">{feature.label}</span>
                  </div>
                )
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
              className="mt-12 grid grid-cols-4 gap-3"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
                  <p className="font-heading text-sm font-bold text-white">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-white/40">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative flex flex-1 items-center justify-center px-6 py-10 sm:px-8 lg:px-10 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6),transparent_40%)] lg:hidden" />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className={`auth-glass relative z-10 w-full ${panelClassName} overflow-hidden rounded-[28px] p-5 sm:p-8`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-70" />
            <div className="absolute -right-12 top-0 h-28 w-28 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-secondary/10 blur-3xl" />
            {children}
          </motion.div>
        </section>
      </div>
    </main>
  )
}
