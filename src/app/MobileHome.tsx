"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, ChevronRight, Star, PiggyBank, Landmark, ShieldAlert, TrendingUp, Smartphone, Users, UserPlus, ChevronDown } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  savings: PiggyBank, loans: Landmark, emergency: ShieldAlert, investments: TrendingUp, digital: Smartphone, portal: Users,
}

function DashboardCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/20 text-[8px] font-bold text-accent">IAS</div>
          <span className="text-[10px] font-semibold text-white/70">Dashboard</span>
        </div>
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[7px] text-white/40">...</div>
      </div>
      <div className="mb-3 rounded-xl bg-white/5 p-3">
        <p className="text-[8px] uppercase tracking-wider text-white/40">Total Portfolio</p>
        <p className="font-heading text-lg font-bold text-white">RWF 4.2B</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] text-emerald-400">+8.7%</span>
          <span className="text-[9px] text-white/40">vs last year</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: "Savings", value: "RWF 2.4B", change: "+12.5%", up: true },
          { label: "Loans", value: "RWF 1.8B", change: "-5.2%", up: false },
          { label: "Dividends", value: "RWF 124M", change: "+8.3%", up: true },
          { label: "Members", value: "20,000+", change: "+15%", up: true },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-white/8 bg-white/5 p-2">
            <p className="text-[8px] text-white/40">{item.label}</p>
            <p className="text-[11px] font-bold text-white">{item.value}</p>
            <p className={`text-[8px] ${item.up ? "text-emerald-400" : "text-red-400"}`}>{item.change}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function TrustBadges() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
    >
      {["Secure Savings", "Affordable Loans", "Transparent Management"].map((item, i) => (
        <motion.span
          key={item}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 + i * 0.15, duration: 0.3 }}
          className="flex items-center gap-1.5 text-[10px] text-white/60"
        >
          <span className="flex h-3 w-3 items-center justify-center rounded-full bg-accent/20">
            <Check className="h-2 w-2 text-accent" />
          </span>
          {item}
        </motion.span>
      ))}
    </motion.div>
  )
}

function SectionHeader({ badge, title, description }: { badge: string; title: string; description?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-auto mb-8 max-w-lg text-center"
    >
      <span className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">{badge}</span>
      <h2 className="mt-3 font-heading text-xl font-bold text-primary">{title}</h2>
      {description && <p className="mt-2 text-xs leading-relaxed text-gray-500">{description}</p>}
    </motion.div>
  )
}

function MobileHero() {
  const { t } = useLanguage()
  const headingLines = t.hero.heading
  return (
    <section className="relative min-h-screen flex flex-col" aria-label="Hero">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#0a2e48] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(22,163,74,0.1),transparent_50%)] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(244,180,0,0.05),transparent_50%)] z-0" />
      <div className="absolute top-[20%] left-[5%] h-32 w-32 rounded-full bg-secondary/10 blur-[60px] animate-pulse z-0" />
      <div className="absolute bottom-[30%] right-[10%] h-40 w-40 rounded-full bg-accent/6 blur-[80px] animate-pulse z-0" style={{ animationDelay: "2s" }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] z-0" />

      <div className="relative z-10 flex flex-1 flex-col px-5 pt-24 pb-8">
        <div className="flex flex-1 flex-col items-center text-center gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-2"
          >
            {headingLines.map((line: string, i: number) => (
              <motion.p
                key={line}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.15 }}
                className="font-heading text-2xl font-bold leading-tight tracking-tight text-white"
              >
                {line}
              </motion.p>
            ))}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.55 }}
              className="text-lg font-bold tracking-[0.15em] text-accent"
            >
              {t.hero.abbreviation}
            </motion.p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="text-xs leading-relaxed text-white/60 max-w-xs"
          >
            {t.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="flex flex-col gap-3 w-full max-w-xs"
          >
            <a
              href="/register"
              className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-primary transition-all active:scale-[0.97]"
            >
              {t.hero.primaryBtn}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/login"
              className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white/85 transition-all active:scale-[0.97]"
            >
              {t.hero.secondaryBtn}
            </a>
          </motion.div>

          <div className="w-full max-w-xs mt-2">
            <DashboardCard />
          </div>

          <div className="mt-2">
            <TrustBadges />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
    </section>
  )
}

function MobileServices() {
  const { t } = useLanguage()
  const [services, setServices] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/services").then(r => r.json()).then(setServices).catch(() => {})
  }, [])
  const items = services.length ? services : []
  return (
    <section className="py-14 px-5 bg-gradient-to-b from-white via-surface/30 to-white">
      <SectionHeader badge={t.services.badge} title={t.services.title} description={t.services.description} />
      <div className="mx-auto max-w-md grid grid-cols-2 gap-3">
        {(items.length ? items : Array.from({ length: 6 }).map((_, i) => ({ title: "", description: "", icon: "savings" }))).slice(0, 6).map((svc, i) => {
          const Icon = serviceIconMap[svc.icon as string] || PiggyBank
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-primary leading-snug">{svc.title || " "}</h3>
              {svc.description && <p className="mt-1 text-[10px] leading-relaxed text-gray-500 line-clamp-2">{svc.description}</p>}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function MobileHowItWorks() {
  const { t } = useLanguage()
  const steps = useMemo(() => [
    { icon: UserPlus, title: t.howItWorks.steps[0].title, desc: t.howItWorks.steps[0].description },
    { icon: PiggyBank, title: t.howItWorks.steps[1].title, desc: t.howItWorks.steps[1].description },
    { icon: TrendingUp, title: t.howItWorks.steps[4].title, desc: t.howItWorks.steps[4].description },
  ], [t])
  return (
    <section className="py-14 px-5 bg-white">
      <SectionHeader badge={t.howItWorks.badge} title={t.howItWorks.title} />
      <div className="mx-auto max-w-md space-y-6">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 items-start"
            >
              <div className="relative flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary-light text-white shadow-md">
                  <Icon className="h-5 w-5" />
                </div>
                {i < 2 && <div className="absolute top-12 left-1/2 -translate-x-1/2 h-6 w-px bg-gradient-to-b from-secondary/30 to-transparent" />}
              </div>
              <div className="pt-1.5">
                <div className="inline-block rounded-full bg-secondary/10 px-2.5 py-0.5 text-[9px] font-semibold text-secondary mb-1.5">
                  {t.howItWorks.stepLabel} {i + 1}
                </div>
                <h3 className="text-sm font-bold text-primary">{step.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

function MobileLoanCalculator() {
  const { t } = useLanguage()
  const [amount, setAmount] = useState(500000)
  const [rate, setRate] = useState(12)
  const [tenure, setTenure] = useState(12)
  const calc = useMemo(() => {
    const r = rate / 100 / 12
    const monthly = r === 0 ? amount / tenure : (amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1)
    return { monthly: Math.round(monthly), total: Math.round(monthly * tenure), interest: Math.round(monthly * tenure - amount) }
  }, [amount, rate, tenure])

  return (
    <section className="py-14 px-5 bg-surface/30">
      <SectionHeader badge={t.loanCalc.badge} title={t.loanCalc.title} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-sm rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-gray-600">{t.loanCalc.loanAmount}</label>
            <input type="range" min={100000} max={5000000} step={50000} value={amount} onChange={e => setAmount(Number(e.target.value))}
              className="mt-1.5 w-full accent-primary h-2 rounded-full appearance-none bg-gray-100" />
            <p className="mt-1 text-right text-sm font-bold text-primary">RWF {amount.toLocaleString()}</p>
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600">{t.loanCalc.interestRate}</label>
            <input type="range" min={5} max={30} step={0.5} value={rate} onChange={e => setRate(Number(e.target.value))}
              className="mt-1.5 w-full accent-secondary h-2 rounded-full appearance-none bg-gray-100" />
            <p className="mt-1 text-right text-sm font-bold text-secondary">{rate}%</p>
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-600">{t.loanCalc.duration}</label>
            <input type="range" min={3} max={60} step={3} value={tenure} onChange={e => setTenure(Number(e.target.value))}
              className="mt-1.5 w-full accent-accent h-2 rounded-full appearance-none bg-gray-100" />
            <p className="mt-1 text-right text-sm font-bold text-gray-800">{tenure} {t.loanCalc.months}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: t.loanCalc.monthlyPayment, value: `RWF ${calc.monthly.toLocaleString()}`, color: "text-secondary" },
            { label: t.loanCalc.totalInterest, value: `RWF ${calc.interest.toLocaleString()}`, color: "text-gray-800" },
            { label: t.loanCalc.totalRepayment, value: `RWF ${calc.total.toLocaleString()}`, color: "text-primary" },
          ].map(item => (
            <div key={item.label} className="rounded-lg bg-gray-50 p-2.5 text-center">
              <p className="text-[8px] font-medium text-gray-400 uppercase tracking-wider">{item.label}</p>
              <p className={`mt-0.5 text-[11px] font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
        <a href="/register"
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-light py-3.5 text-sm font-semibold text-white shadow-md active:scale-[0.97] transition-all">
          {t.loanCalc.applyNow}
          <ChevronRight className="h-4 w-4" />
        </a>
      </motion.div>
    </section>
  )
}

function MobileTestimonials() {
  const { t } = useLanguage()
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    fetch("/api/testimonials").then(r => r.json()).then(data => setTestimonials(data.slice(0, 3))).catch(() => {})
  }, [])

  const goTo = useCallback((i: number) => {
    setDirection(i > current ? 1 : -1)
    setCurrent(i)
  }, [current])

  useEffect(() => {
    if (testimonials.length < 2) return
    const timer = setInterval(() => goTo((current + 1) % testimonials.length), 5000)
    return () => clearInterval(timer)
  }, [current, testimonials.length, goTo])

  if (!testimonials.length) return null

  return (
    <section className="py-14 px-5 bg-white">
      <SectionHeader badge={t.testimonials.badge} title={t.testimonials.title} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-sm"
      >
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ x: direction > 0 ? 50 : -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -50 : 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-accent text-sm font-bold text-white shadow-md">
                {testimonials[current].name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div className="mt-3 flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < testimonials[current].rating ? "fill-accent text-accent" : "fill-gray-200 text-gray-200"}`} />
                ))}
              </div>
              <blockquote className="mt-3 text-xs leading-relaxed text-gray-600 italic">&ldquo;{testimonials[current].quote}&rdquo;</blockquote>
              <p className="mt-3 text-xs font-semibold text-primary">{testimonials[current].name}</p>
              {testimonials[current].role && <p className="text-[10px] text-gray-400">{testimonials[current].role}</p>}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-primary" : "w-1.5 bg-gray-300"}`}
              aria-label={`Testimonial ${i + 1}`} />
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function MobileFAQ() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const faqs = useMemo(() => t.faq.items.slice(0, 4), [t])

  return (
    <section className="py-14 px-5 bg-surface/20">
      <SectionHeader badge={t.faq.badge} title={t.faq.title} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-sm space-y-2.5"
      >
        {faqs.map((faq: { question: string; answer: string }, i: number) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              aria-expanded={openIndex === i}>
              <span className="text-sm font-semibold text-primary flex-1 leading-snug">{faq.question}</span>
              <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="h-4 w-4 text-secondary flex-shrink-0" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <div className="px-4 pb-4">
                    <div className="mb-2 h-px bg-gradient-to-r from-secondary/20 to-transparent" />
                    <p className="text-xs leading-relaxed text-gray-600">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

function MobileCTA() {
  const { t } = useLanguage()
  return (
    <section className="relative overflow-hidden py-16 px-5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#06243A]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(22,163,74,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(244,180,0,0.08),transparent_50%)]" />
      <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-accent/5 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 mx-auto max-w-sm text-center"
      >
        <h2 className="font-heading text-xl font-bold leading-tight text-white">{t.cta.title}</h2>
        <p className="mt-3 text-xs leading-relaxed text-white/70">{t.cta.description}</p>
        <div className="mt-6 flex flex-col gap-3">
          <a href="/register"
            className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-lg active:scale-[0.97] transition-all">
            {t.cta.primaryBtn}
            <ChevronRight className="h-4 w-4" />
          </a>
          <a href="#contact"
            className="flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-6 py-3.5 text-sm font-semibold text-white/90 active:scale-[0.97] transition-all">
            {t.cta.secondaryBtn}
          </a>
        </div>
      </motion.div>
    </section>
  )
}

export default function MobileHome() {
  return (
    <main className="min-h-screen bg-white lg:hidden">
      <MobileHero />
      <MobileServices />
      <MobileHowItWorks />
      <MobileLoanCalculator />
      <MobileTestimonials />
      <MobileFAQ />
      <MobileCTA />
    </main>
  )
}
