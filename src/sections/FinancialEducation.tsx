"use client"

import { motion } from "framer-motion"
import { BookOpen, GraduationCap, TrendingUp, ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const cardIcons = [BookOpen, GraduationCap, TrendingUp]
const cardGradients = ["from-secondary/10 to-secondary/5", "from-primary/10 to-primary/5", "from-accent/10 to-accent/5"]
const cardIconBgs = ["from-secondary to-secondary-light", "from-primary to-primary-light", "from-accent to-accent-light"]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0, 1] as const },
  },
}

export default function FinancialEducation() {
  const { t } = useLanguage()
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" aria-label="Financial education">
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-white to-surface" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(244,180,0,0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(22,163,74,0.04),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {t.financialEd.badge}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">
            {t.financialEd.title}
          </h2>
          <p className="mt-4 text-gray-600">
            {t.financialEd.description}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {t.financialEd.cards.map((card, i) => {
            const Icon = cardIcons[i]
            return (
              <motion.div
                key={card.title}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-[24px] bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cardGradients[i]} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/50 blur-2xl" />

                <div className="relative z-10">
                  <div
                    className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cardIconBgs[i]} shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="font-heading text-xl font-bold text-primary">{card.title}</h3>
                  <p className="mt-3 leading-relaxed text-gray-600">{card.description}</p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-secondary transition-all duration-300 group-hover:gap-3">
                    {t.financialEd.readGuide}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
