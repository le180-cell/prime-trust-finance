"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, MapPin, Phone, Mail, ChevronRight, Facebook, Twitter, Linkedin, Instagram, Copy, CreditCard } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

const quickLinksHrefs = ["#about", "#services", "#loans", "#savings", "#news", "#contact"]
const serviceHrefs = ["#services", "#services", "#services", "#services", "#services", "#services"]

const socialIcons = [Facebook, Twitter, Linkedin, Instagram]

const IAS_ACCOUNT = "4074200086837"

export default function Footer() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [cms, setCms] = useState<Record<string, Record<string, string>>>({})

  useEffect(() => {
    fetch("/api/cms")
      .then(r => r.json())
      .then(data => setCms(data))
      .catch(() => {})
  }, [])

  const contact = cms.contact || {}
  const social = cms.social || {}
  const footer = cms.footer || {}
  const address = contact.address || "KG 123 Ave, Kigali, Rwanda"
  const phone = contact.phone || "+250 788 123 456"
  const emailAddr = contact.email || "info@ias.rw"

  const socialLabels = ["Facebook", "Twitter", "LinkedIn", "Instagram"]
  const socialUrls = [social.facebook || "#", social.twitter || "#", social.linkedin || "#", social.instagram || "#"]

  const copyAccount = () => {
    navigator.clipboard.writeText(IAS_ACCOUNT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer id="contact" className="relative" role="contentinfo">
      <div className="absolute inset-0 bg-[#0a2640]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(22,163,74,0.08),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-8 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white font-bold text-lg">IAS</div>
              <span className="font-heading text-xl font-bold text-white">IAS</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{t.footer.description}</p>
            <div className="mt-6 flex gap-3">
              {socialIcons.map((Icon, i) => (
                <a key={socialLabels[i]} href={socialUrls[i]} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all duration-300 hover:bg-white/20 hover:text-white" aria-label={`Follow us on ${socialLabels[i]}`}>
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">{t.footer.quickLinks}</h3>
            <ul className="mt-6 space-y-3">
              {t.footer.quickLinksItems.map((label, i) => (
                <li key={label}>
                  <a href={quickLinksHrefs[i]} className="inline-flex items-center gap-1 text-sm text-white/60 transition-colors duration-300 hover:text-white">
                    <ChevronRight className="h-3 w-3" />{label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">{t.footer.services}</h3>
            <ul className="mt-6 space-y-3">
              {t.footer.serviceItems.map((label, i) => (
                <li key={label}>
                  <a href={serviceHrefs[i]} className="inline-flex items-center gap-1 text-sm text-white/60 transition-colors duration-300 hover:text-white">
                    <ChevronRight className="h-3 w-3" />{label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-white">{t.footer.contactUs}</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="h-4 w-4 flex-shrink-0 text-secondary" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="h-4 w-4 flex-shrink-0 text-secondary" />
                <span>{emailAddr}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <CreditCard className="h-4 w-4 flex-shrink-0 text-secondary" />
                <span className="font-mono tracking-wider">{IAS_ACCOUNT}</span>
                <button onClick={copyAccount} className="ml-auto flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white/50 transition-all hover:bg-white/20 hover:text-white" aria-label="Copy account number">
                  {copied ? <span className="text-xs text-secondary">✓</span> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="font-heading text-sm font-semibold text-white">{t.footer.newsletter}</h4>
              <form onSubmit={handleSubscribe} className="mt-3 flex">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.footer.newsletterPlaceholder} required aria-label="Email for newsletter"
                  className="flex-1 rounded-l-full bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-secondary" />
                <button type="submit" className="flex items-center justify-center rounded-r-full bg-secondary px-4 text-white transition-all hover:bg-secondary-light" aria-label="Subscribe to newsletter">
                  {subscribed ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-sm">{t.footer.subscribed}</motion.span> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 rounded-xl bg-white/5 p-6 sm:grid-cols-2 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/20">
              <MapPin className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{t.footer.visitOffice}</p>
              <p className="mt-0.5 text-xs text-white/50">{address}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/20">
              <Phone className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{t.footer.callUs}</p>
              <p className="mt-0.5 text-xs text-white/50">{phone}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-white/40">{footer.copyright || t.footer.rights.replace("{year}", String(new Date().getFullYear()))}</p>
        </div>
      </div>
    </footer>
  )
}
