"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import type { Testimonial } from "@/types"
import { useLanguage } from "@/contexts/LanguageContext"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${i < rating ? "fill-accent text-accent" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-accent text-base font-bold text-white shadow-lg shadow-primary/20">
      {initials}
    </div>
  )
}

export default function Testimonials() {
  const { t: lang } = useLanguage()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((data) => setTestimonials(data))
      .catch(() => {})
  }, [])

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }, [current])

  const next = useCallback(() => {
    if (testimonials.length === 0) return
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  useEffect(() => {
    if (testimonials.length === 0) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, testimonials.length])

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  }

  if (testimonials.length === 0) return null

  const testimonial = testimonials[current]

  return (
    <section className="relative py-24 sm:py-32" aria-label="Testimonials">
      <div className="absolute inset-0 bg-surface" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(244,180,0,0.05),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {lang.testimonials.badge}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-primary sm:text-4xl">
            {lang.testimonials.title}
          </h2>
          <p className="mt-4 text-gray-600">
            {lang.testimonials.description}
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 p-8 shadow-lg sm:p-12">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0, 1] as const }}
                className="flex flex-col items-center text-center"
              >
                <Avatar name={testimonial.name} />
                <div className="mt-4">
                  <StarRating rating={testimonial.rating} />
                </div>
                <blockquote className="mt-6 text-lg leading-relaxed text-gray-700 italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-6">
                  <p className="font-heading font-semibold text-primary">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => goTo((current - 1 + testimonials.length) % testimonials.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm text-gray-600 transition-all hover:border-primary hover:text-primary hover:shadow-lg"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2" role="tablist" aria-label="Testimonial indicators">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? "w-8 bg-primary" : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => goTo((current + 1) % testimonials.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm text-gray-600 transition-all hover:border-primary hover:text-primary hover:shadow-lg"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
