"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface PartnerData {
  id: number
  name: string
  sortOrder: number
}

export default function Partners() {
  const [partners, setPartners] = useState<PartnerData[]>([])

  useEffect(() => {
    fetch("/api/partners")
      .then((r) => r.json())
      .then((data) => setPartners(data))
      .catch(() => {})
  }, [])

  if (partners.length === 0) return null

  const duplicated = [...partners, ...partners]

  return (
    <section className="relative overflow-hidden py-16 sm:py-20" aria-label="Our partners">
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Trusted Partners
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-surface to-transparent" />
        <div className="absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-surface to-transparent" />

        <motion.div
          className="flex gap-16 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {duplicated.map((partner, i) => (
            <div
              key={`${partner.name}-${i}`}
              className="flex-shrink-0 flex items-center justify-center h-16 px-8 rounded-xl bg-white/70 backdrop-blur-sm border border-white/20 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20"
            >
              <span className="font-heading text-lg font-semibold text-gray-400 whitespace-nowrap">
                {partner.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
