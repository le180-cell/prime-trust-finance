"use client"

import { motion } from "framer-motion"
import { UserPlus, PiggyBank, FileText, CheckCircle2, TrendingUp } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const stepIcons = [UserPlus, PiggyBank, FileText, CheckCircle2, TrendingUp]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
}

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0, 1] as const },
  },
}

export default function HowItWorks() {
  const { t } = useLanguage()
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" aria-label="How it works">
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-white to-surface" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(22,163,74,0.03),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-20 max-w-2xl text-center"
        >
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {t.howItWorks.badge}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">
            {t.howItWorks.title}
          </h2>
          <p className="mt-4 text-gray-600">
            {t.howItWorks.description}
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 hidden w-px md:block bg-gradient-to-b from-secondary/40 via-secondary/20 to-transparent" />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-12 md:space-y-16"
          >
            {t.howItWorks.steps.map((step, index) => {
              const Icon = stepIcons[index]
              const isLeft = index % 2 === 0

              return (
                <motion.div
                  key={index}
                  variants={stepVariants}
                  className={`relative flex flex-col md:flex-row items-start gap-6 ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className="relative z-10 flex-shrink-0 ml-0 md:ml-0">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg border border-gray-100 ${
                      isLeft ? "md:ml-0" : "md:mr-0"
                    }`}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary-light text-white">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shadow-md">
                      {index + 1}
                    </div>
                  </div>

                  <div className={`flex-1 ${isLeft ? "md:pl-8 md:text-left" : "md:pr-8 md:text-right"} text-left`}>
                    <div className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-xs font-semibold text-secondary">
                      {t.howItWorks.stepLabel} {index + 1}
                    </div>
                    <h3 className="mt-3 font-heading text-xl font-bold text-primary">{step.title}</h3>
                    <p className="mt-2 max-w-lg text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
