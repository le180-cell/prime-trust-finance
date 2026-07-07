"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts"

interface SavingsChartProps {
  data: Array<{ month: string; amount: number; contributions: number }>
}

export default function SavingsChart({ data }: SavingsChartProps) {
  const [range, setRange] = useState<"6m" | "1y" | "all">("1y")

  const filtered = range === "all" ? data : range === "1y" ? data : data.slice(-6)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-slate-900">Savings Growth</h3>
          <p className="mt-0.5 text-sm text-slate-500">Your savings balance over time</p>
        </div>
        <div className="flex gap-1 rounded-[12px] bg-slate-50 p-1">
          {(["6m", "1y", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-[10px] px-3 py-1.5 text-xs font-semibold transition-all ${
                range === r ? "bg-white text-primary shadow-[0_2px_8px_rgba(15,23,42,0.06)]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {r === "6m" ? "6 Months" : r === "1y" ? "1 Year" : "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filtered}>
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B3C5D" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#0B3C5D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}M`} />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #E2E8F0",
                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
                fontSize: 13,
              }}
              formatter={(value) => [`RWF ${new Intl.NumberFormat("en-US").format(Number(value))}`, ""]}
            />
            <Area type="monotone" dataKey="amount" stroke="#0B3C5D" strokeWidth={2.5} fill="url(#savingsGradient)" dot={false} activeDot={{ r: 5, fill: "#0B3C5D", stroke: "#fff", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
