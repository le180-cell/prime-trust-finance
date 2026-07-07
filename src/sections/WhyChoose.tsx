"use client"

import { motion } from "framer-motion"
import { Clock, Zap, ShieldCheck, Heart, Eye, BookOpen } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface WhyChooseItem {
  title: string
  description: string
  icon: string
}

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  clock: Clock, zap: Zap, shield: ShieldCheck, heart: Heart, eye: Eye, bookOpen: BookOpen,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0, 1] as const } },
}

const iconKeys = ["clock", "zap", "shield", "heart", "eye", "bookOpen"] as const

export default function WhyChoose() {
  const { t } = useLanguage()
  return (
    <section className="relative py-24 sm:py-32" aria-label="Why choose us">
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {t.whyChoose.badge}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">
            {t.whyChoose.title}
          </h2>
          <p className="mt-4 text-gray-600">
            {t.whyChoose.description}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {t.whyChoose.items.map((item, i) => {
            const Icon = icons[iconKeys[i]]
            return (
              <motion.div
                key={item.title}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30" />
                <div className="relative z-10">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 transition-all duration-500 group-hover:from-primary/20 group-hover:to-secondary/20 group-hover:shadow-lg group-hover:shadow-primary/20">
                    <Icon className="h-7 w-7 text-primary transition-all duration-500 group-hover:scale-110" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-primary">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
