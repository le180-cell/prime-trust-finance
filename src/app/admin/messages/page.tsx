"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail, Trash2, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp,
  Clock, Reply, Send, User,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  name: string
  email: string
  subject: string
  message: string
  read: number
  createdAt: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

function SkeletonRow() {
  return (
    <div className="rounded-[24px] bg-white/60 backdrop-blur-sm border border-white/20 p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="h-3 w-36 rounded bg-gray-100" />
        </div>
        <div className="h-3 w-20 rounded bg-gray-100" />
      </div>
    </div>
  )
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [replyOpen, setReplyOpen] = useState<Set<number>>(new Set())
  const [replyText, setReplyText] = useState("")
  const fetchRef = useRef(0)

  useEffect(() => {
    const id = ++fetchRef.current
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((data) => { if (fetchRef.current === id) setMessages(data.messages || []) })
      .catch(() => {})
      .finally(() => { if (fetchRef.current === id) setLoading(false) })
  }, [])

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleReply = (id: number) => {
    setReplyOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); setReplyText("") }
      else next.add(id)
      return next
    })
  }

  async function toggleRead(id: number, currentRead: number) {
    await fetch("/api/admin/messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: !currentRead }),
    })
    refresh()
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this message?")) return
    await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" })
    refresh()
  }

  function refresh() {
    setLoading(true)
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const unreadCount = messages.filter((m) => !m.read).length
  const sorted = [...messages].sort((a, b) => (a.read ? 1 : 0) - (b.read ? 1 : 0))

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="mb-8" variants={cardVariants}>
        <h1 className="font-heading text-2xl font-bold text-[#0B3C5D] sm:text-3xl">Messages</h1>
        <p className="mt-1 text-gray-500">
          {messages.length} total · <span className="font-semibold text-[#16A34A]">{unreadCount} unread</span>
        </p>
      </motion.div>

      <motion.div className="mb-6" variants={cardVariants}>
        <button onClick={refresh} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-all">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : sorted.length === 0 ? (
        <motion.div variants={cardVariants} className="admin-card p-14 text-center">
          <Mail className="mx-auto h-14 w-14 text-gray-300" />
          <p className="mt-4 text-gray-500 text-lg">No messages yet.</p>
        </motion.div>
      ) : (
        <motion.div className="space-y-3" variants={containerVariants}>
          <AnimatePresence>
            {sorted.map((msg) => (
              <motion.div key={msg.id} variants={cardVariants} layout className={cn(
                "admin-card overflow-hidden transition-all hover:shadow-md",
                !msg.read && "border-l-4 border-l-[#16A34A]"
              )}>
                <button onClick={() => toggleExpand(msg.id)} className="flex w-full items-center justify-between p-5 text-left">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold flex-shrink-0",
                      msg.read ? "bg-gray-100 text-gray-500" : "bg-[#16A34A]/10 text-[#16A34A]"
                    )}>
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={cn("truncate", msg.read ? "text-gray-700" : "font-semibold text-gray-900")}>
                        {msg.subject || "(No subject)"}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {msg.name} · {msg.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                    {!msg.read && <span className="h-2 w-2 rounded-full bg-[#16A34A]" />}
                    {expanded.has(msg.id) ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                  </div>
                </button>
                <AnimatePresence>
                  {expanded.has(msg.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" as const }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 px-5 py-4">
                        <div className="admin-card p-4">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="flex items-center gap-1.5 rounded-xl bg-[#16A34A] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#16A34A]/80">
                            <Mail className="h-4 w-4" /> Reply via Email
                          </a>
                          <button onClick={() => toggleReply(msg.id)} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/60 px-4 py-2 text-sm text-gray-600 transition-all hover:bg-white/80">
                            <Reply className="h-4 w-4" /> {replyOpen.has(msg.id) ? "Close Reply" : "Reply"}
                          </button>
                          <button onClick={() => toggleRead(msg.id, msg.read)} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white/60 px-4 py-2 text-sm text-gray-600 transition-all hover:bg-white/80">
                            {msg.read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {msg.read ? "Mark Unread" : "Mark Read"}
                          </button>
                          <button onClick={() => handleDelete(msg.id)} className="ml-auto flex items-center gap-1.5 rounded-xl border border-red-200/50 px-4 py-2 text-sm text-red-500 transition-all hover:bg-red-50/80">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                        <AnimatePresence>
                          {replyOpen.has(msg.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 rounded-xl border border-gray-200 bg-white/60 p-3">
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder={`Reply to ${msg.name}...`}
                                  rows={3}
                                  className="w-full resize-none rounded-lg border-0 bg-transparent p-2 text-sm outline-none text-gray-700 placeholder-gray-400"
                                />
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                  <span className="text-xs text-gray-400">Your reply will be sent via email</span>
                                  <button
                                    onClick={() => { setReplyText(""); toggleReply(msg.id) }}
                                    disabled={!replyText.trim()}
                                    className="flex items-center gap-1 rounded-lg bg-[#0B3C5D] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#0B3C5D]/80 disabled:opacity-50"
                                  >
                                    <Send className="h-3 w-3" /> Send
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
