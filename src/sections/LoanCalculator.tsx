"use client"

import { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { calculateLoan } from "@/lib/utils"
import { ArrowRight, DollarSign, Percent, Clock } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

function DonutChart({ interest, total, t }: { interest: number; total: number; t: { principal: string; interest: string } }) {
  const principal = total - interest
  const pctPrincipal = total > 0 ? (principal / total) * 100 : 0
  const pctInterest = total > 0 ? (interest / total) * 100 : 0

  const circumference = 2 * Math.PI * 40
  const principalOffset = circumference - (circumference * pctPrincipal) / 100
  const interestOffset = circumference - (circumference * pctInterest) / 100

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100" />
        <circle
          cx="50" cy="50" r="40"
          fill="none" stroke="currentColor" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={principalOffset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
        <circle
          cx="50" cy="50" r="40"
          fill="none" stroke="currentColor" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={interestOffset}
          strokeLinecap="round"
          className="text-secondary transition-all duration-500"
          transform="rotate(0 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-primary font-heading">
          {total > 0 ? `${Math.round(pctPrincipal)}%` : "—"}
        </span>
      </div>
      <div className="mt-3 flex gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-gray-500">{t.principal}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-secondary" />
          <span className="text-gray-500">{t.interest}</span>
        </div>
      </div>
    </div>
  )
}

export default function LoanCalculator() {
  const { t } = useLanguage()
  const [amount, setAmount] = useState(1000000)
  const [rate, setRate] = useState(12)
  const [months, setMonths] = useState(12)

  const result = useMemo(() => calculateLoan(amount, rate, months), [amount, rate, months])

  const formatRWF = useCallback((val: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }, [])

  return (
    <section id="loans" className="relative py-24 sm:py-32" aria-label="Loan calculator">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-surface/50 to-white" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {t.loanCalc.badge}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">
            {t.loanCalc.title}
          </h2>
          <p className="mt-4 text-gray-600">
            {t.loanCalc.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 p-8 shadow-xl sm:p-12"
        >
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-8">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="amount" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="h-4 w-4 text-secondary" />
                    {t.loanCalc.loanAmount}
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="amount"
                    type="range"
                    min={100000}
                    max={50000000}
                    step={100000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full appearance-none h-2 rounded-full bg-gray-200 accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30 [&::-webkit-slider-thumb]:cursor-pointer"
                    aria-valuemin={100000}
                    aria-valuemax={50000000}
                    aria-valuenow={amount}
                  />
                </div>
                <div className="mt-2 text-right font-heading text-xl font-bold text-primary">
                  {formatRWF(amount)}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="rate" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Percent className="h-4 w-4 text-secondary" />
                    {t.loanCalc.interestRate}
                  </label>
                </div>
                <input
                  id="rate"
                  type="range"
                  min={5}
                  max={30}
                  step={0.5}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full appearance-none h-2 rounded-full bg-gray-200 accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30 [&::-webkit-slider-thumb]:cursor-pointer"
                  aria-valuemin={5}
                  aria-valuemax={30}
                  aria-valuenow={rate}
                />
                <div className="mt-2 text-right font-heading text-xl font-bold text-primary">
                  {rate}%
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="duration" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4 text-secondary" />
                    {t.loanCalc.duration}
                  </label>
                </div>
                <input
                  id="duration"
                  type="range"
                  min={3}
                  max={60}
                  step={1}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full appearance-none h-2 rounded-full bg-gray-200 accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30 [&::-webkit-slider-thumb]:cursor-pointer"
                  aria-valuemin={3}
                  aria-valuemax={60}
                  aria-valuenow={months}
                />
                <div className="mt-2 text-right font-heading text-xl font-bold text-primary">
                  {months} {t.loanCalc.months}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${amount}-${rate}-${months}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full space-y-6"
                >
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-500">{t.loanCalc.monthlyPayment}</p>
                    <p className="font-heading text-4xl font-bold text-primary">
                      {formatRWF(result.monthlyPayment)}
                    </p>
                  </div>

                  <div className="relative flex justify-center">
                    <DonutChart interest={result.totalInterest} total={result.totalRepayment} t={{ principal: t.loanCalc.principal, interest: t.loanCalc.interest }} />
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{t.loanCalc.totalInterest}</p>
                      <p className="font-heading text-xl font-bold text-secondary">
                        {formatRWF(result.totalInterest)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{t.loanCalc.totalRepayment}</p>
                      <p className="font-heading text-xl font-bold text-primary">
                        {formatRWF(result.totalRepayment)}
                      </p>
                    </div>
                  </div>

                  <a
                    href="#contact"
                    className="group mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-primary-light hover:shadow-lg hover:shadow-primary/30"
                  >
                    {t.loanCalc.applyNow}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
