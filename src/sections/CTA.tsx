"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function CTA() {
  const { t } = useLanguage()
  return (
    <section className="relative overflow-hidden py-24 sm:py-32" aria-label="Call to action">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#06243A]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(22,163,74,0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(244,180,0,0.1),transparent_50%)]" />

      <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-secondary/10 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-primary-light/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "4s" }} />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] as const }}
        >
          <h2 className="font-heading text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
            {t.cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/70 sm:text-base">
            {t.cta.description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/register"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)] sm:px-8 sm:py-3.5 sm:text-base"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-accent to-accent-light opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-primary">
                {t.cta.primaryBtn}
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 sm:h-5 sm:w-5" />
              </span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white/90 transition-all duration-300 hover:border-white/60 hover:bg-white/10 sm:px-8 sm:py-3.5 sm:text-base"
            >
              {t.cta.secondaryBtn}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
