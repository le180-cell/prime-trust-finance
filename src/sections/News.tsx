"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import type { NewsItem } from "@/types"
import { useLanguage } from "@/contexts/LanguageContext"

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.1, 0, 1] as const },
  }),
}

function NewsCard({ item, index, readMore }: { item: NewsItem; index: number; readMore: string }) {
  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="group overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-primary/20"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 sm:h-56">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl font-bold text-primary/20 font-heading">IAS</div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="p-6 sm:p-8">
        <time className="text-xs font-medium text-secondary">{item.date}</time>
        <h3 className="mt-2 font-heading text-lg font-semibold text-primary transition-colors duration-300 group-hover:text-secondary">
          {item.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">{item.excerpt}</p>
        <a
          href={`/news/${item.slug}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors duration-300 hover:text-secondary"
          aria-label={`Read more about ${item.title}`}
        >
          {readMore}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </motion.article>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export default function News() {
  const { t } = useLanguage()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((data) => { setNews(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section id="news" className="relative py-24 sm:py-32" aria-label="Latest news">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-surface/50 to-white" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            {t.news.badge}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">
            {t.news.title}
          </h2>
          <p className="mt-4 text-gray-600">
            {t.news.description}
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-100" />
              ))
            : news.map((item, i) => (
                <NewsCard key={item.slug} item={{ ...item, date: formatDate(item.date) }} index={i} readMore={t.news.readMore} />
              ))}
        </div>
      </div>
    </section>
  )
}
