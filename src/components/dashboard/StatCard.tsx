"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface StatCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  trend?: number
  icon: React.ReactNode
  color: string
  sparkline?: number[]
  delay?: number
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const duration = 1200
    const steps = 40
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        setDisplay(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  const formatted = new Intl.NumberFormat("en-US").format(display)

  return (
    <span>
      {prefix}{formatted}{suffix}
    </span>
  )
}

export default function StatCard({ label, value, prefix = "", suffix = "", trend, icon, color, sparkline, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          }`}>
            <span className={`inline-block h-0 w-0 border-l-[4px] border-r-[4px] ${
              trend >= 0 ? "border-b-[5px] border-b-emerald-500 border-l-transparent border-r-transparent" : "border-t-[5px] border-t-red-500 border-l-transparent border-r-transparent"
            }`} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 font-heading text-2xl font-bold tracking-tight text-slate-900">
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
        </p>
      </div>

      {sparkline && sparkline.length > 0 && (
        <svg className="absolute bottom-3 right-4 h-8 w-20 opacity-30" viewBox="0 0 80 32">
          <path
            d={`M 0 ${32 - (sparkline[0] / Math.max(...sparkline)) * 28} ${sparkline.map((v, i) => `L ${(i / (sparkline.length - 1)) * 80} ${32 - (v / Math.max(...sparkline)) * 28}`).join(" ")}`}
            fill="none"
            stroke={trend !== undefined && trend >= 0 ? "#16A34A" : "#EF4444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </motion.div>
  )
}
