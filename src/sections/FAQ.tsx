"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, HelpCircle } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

function AccordionItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: { question: string; answer: string }
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="group rounded-[24px] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-8"
        aria-expanded={isOpen}
      >
        <span className="font-heading text-base font-semibold text-primary sm:text-lg">
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
          className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-secondary"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 sm:px-8">
              <div className="h-px bg-gradient-to-r from-secondary/20 via-secondary/10 to-transparent mb-4" />
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="relative py-24 sm:py-32" aria-label="Frequently asked questions">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-surface/30 to-white" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10">
            <HelpCircle className="h-6 w-6 text-secondary" />
          </div>
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {t.faq.badge}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">
            {t.faq.title}
          </h2>
          <p className="mt-4 text-gray-600">
            {t.faq.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
          className="space-y-4"
        >
          {t.faq.items.map((faq, i) => (
            <AccordionItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
