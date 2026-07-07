"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react"

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })

type ResetValues = z.infer<typeof resetSchema>

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const onSubmit = async (values: ResetValues) => {
    if (!token) {
      toast.error("Invalid reset link.")
      return
    }
    setLoading(true)
    const pending = toast.loading("Resetting your password...")

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(data.error || "Reset failed.")
      toast.success("Password reset successfully.", { id: pending })
      router.push("/login")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.", {
        id: pending,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-600">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="mt-4 inline-block font-semibold text-primary">
          Request a new reset
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-600">New Password</span>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            className="auth-input w-full rounded-[20px] border border-slate-200 bg-white/95 px-4 py-3 pr-12 text-sm outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password ? (
          <p className="mt-2 text-xs font-medium text-red-600">{errors.password.message}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-600">Confirm Password</span>
        <input
          {...register("confirmPassword")}
          type={showPassword ? "text" : "password"}
          placeholder="Confirm your new password"
          className="auth-input w-full rounded-[20px] border border-slate-200 bg-white/95 px-4 py-3 text-sm outline-none"
        />
        {errors.confirmPassword ? (
          <p className="mt-2 text-xs font-medium text-red-600">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </label>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-[#0B3C5D] to-[#0E4F75] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(11,60,93,0.24)] transition hover:-translate-y-0.5 disabled:opacity-70"
      >
        {loading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <KeyRound className="h-4 w-4" />
        )}
        Reset Password
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="auth-shell min-h-screen px-6 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-lg items-center">
        <div className="auth-glass relative w-full overflow-hidden rounded-[28px] p-6 sm:p-10">
          <div className="flex w-fit items-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <ShieldCheck className="h-4 w-4" /> New Password
          </div>
          <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-slate-900">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter a new password for your IAS account.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="py-8 text-center">Loading...</div>}>
              <ResetForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}
