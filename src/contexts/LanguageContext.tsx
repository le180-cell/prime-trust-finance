"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type Locale, type Translations, translations, locales, localeNames } from "@/i18n/translations"

type LanguageContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Translations
  locales: readonly Locale[]
  localeNames: Record<Locale, string>
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("ias-locale") as Locale | null
    if (saved && locales.includes(saved)) setLocale(saved)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem("ias-locale", locale)
  }, [locale, mounted])

  if (!mounted) return <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale], locales, localeNames }}>{children}</LanguageContext.Provider>

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale], locales, localeNames }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
