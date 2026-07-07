"use client"

import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { ArrowLeft, LoaderCircle, MailCheck, ShieldCheck } from "lucide-react"

const recoverySchema = z.object({
  identifier: z.string().min(2, "Enter your email or username."),
})

type RecoveryValues = z.infer<typeof recoverySchema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryValues>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { identifier: "" },
  })

  const onSubmit = async (values: RecoveryValues) => {
    setLoading(true)
    const pending = toast.loading("Preparing secure recovery...")

    try {
      const response = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const payload = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(payload.error || "Unable to process request.")
      toast.success("If the account exists, recovery instructions have been prepared.", { id: pending })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to process request.", { id: pending })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell min-h-screen px-6 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center">
        <div className="auth-glass relative w-full overflow-hidden rounded-[28px] p-6 sm:p-10">
          <div className="absolute -right-12 top-0 h-28 w-28 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-secondary/10 blur-3xl" />
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>

          <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <ShieldCheck className="h-4 w-4" /> Secure Recovery
              </div>
              <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight text-slate-900">Reset access</h1>
              <p className="mt-4 max-w-md text-base leading-8 text-slate-500">
                Enter your email or username and we&apos;ll prepare a secure recovery request for your IAS account.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Email or Username</span>
                  <input
                    {...register("identifier")}
                    className="auth-input w-full rounded-[20px] border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none"
                    placeholder="you@example.com or username"
                  />
                  {errors.identifier ? <p className="mt-2 text-xs font-medium text-red-600">{errors.identifier.message}</p> : null}
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#0B3C5D] to-[#0E4F75] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(11,60,93,0.24)] transition hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
                  Send recovery request
                </button>
              </form>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">What happens next</p>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">1. We verify the identifier without exposing account existence.</div>
                <div className="rounded-2xl bg-slate-50 p-4">2. A secure recovery action is prepared for your profile.</div>
                <div className="rounded-2xl bg-slate-50 p-4">3. Follow the instructions to regain access safely.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
