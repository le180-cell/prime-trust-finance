"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import type { ButtonHTMLAttributes } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { Eye, EyeOff, LoaderCircle, Lock, Mail, ShieldCheck } from "lucide-react"
import AuthShell from "@/components/auth/AuthShell"

const loginSchema = z.object({
  username: z.string().min(2, "Enter your username or email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  rememberMe: z.boolean().optional(),
})

type LoginValues = z.infer<typeof loginSchema>

function RippleButton({
  children,
  loading,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  return (
    <button
      {...props}
      className={className}
      onPointerDown={(event) => {
        const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect()
        const ripple = { x: event.clientX - rect.left, y: event.clientY - rect.top, id: Date.now() }
        setRipples((state) => [...state, ripple])
        window.setTimeout(() => setRipples((state) => state.filter((entry) => entry.id !== ripple.id)), 650)
        props.onPointerDown?.(event)
      }}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="auth-ripple"
          style={{ left: ripple.x - 10, top: ripple.y - 10, width: 20, height: 20 }}
        />
      ))}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      </span>
    </button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)



  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", rememberMe: true },
  })

  const stats = useMemo(
    () => [
      { value: 20000, suffix: "+", label: "Members" },
      { value: 45, suffix: "B RWF", label: "Savings" },
      { value: 98, suffix: "%", label: "Recovery" },
      { value: 25, suffix: "+", label: "Years" },
    ],
    [],
  )

  const onSubmit = async (values: LoginValues) => {
    setLoading(true)
    const pending = toast.loading("Signing you in...")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: values.username, password: values.password }),
      })
      const payload = (await response.json()) as { error?: string; user?: { role?: string } }

      if (!response.ok) throw new Error(payload.error || "Login failed.")

      toast.success("Welcome back. Secure access granted.", { id: pending })
      if (values.rememberMe) localStorage.setItem("ias_saved_identifier", values.username)
      router.push(payload.user?.role === "admin" ? "/admin" : "/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in.", { id: pending })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      badge="Trusted Financial Cooperative"
      title={<>Welcome Back to<br />Your Financial<br />Community</>}
      subtitle="Manage savings, loans, payments and financial records securely from anywhere."
      features={[
        { label: "Secure Login" },
        { label: "Loan Management" },
        { label: "Savings Tracking" },
        { label: "Transparent Reports" },
      ]}
      stats={stats}
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#0E4F75] text-sm font-bold text-white shadow-[0_18px_36px_rgba(11,60,93,0.28)]">
              IAS
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Ikimina Abanyamuryango Solidarity</p>
              <p className="font-heading text-2xl font-bold text-slate-900">Welcome Back</p>
            </div>
          </Link>
          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:inline-flex">
            <ShieldCheck className="h-4 w-4" />
            Secure session
          </div>
        </div>

        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">Sign in</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">Sign in to access your financial dashboard.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Login form">
          <label className="group relative block">
            <span className="sr-only">Username</span>
            <div className="auth-input relative rounded-[22px] border border-slate-200 bg-white/90 px-4 pb-3 pt-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-transform duration-200 focus-within:-translate-y-0.5">
              <Mail className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-slate-400" />
              <input
                {...register("username")}
                id="username"
                autoComplete="username"
                placeholder=" "
                className="peer w-full bg-transparent pt-4 text-[15px] font-medium text-slate-900 outline-none placeholder:text-transparent"
                aria-invalid={Boolean(errors.username)}
              />
              <span className="auth-floating-label pointer-events-none absolute left-4 top-4 text-sm text-slate-500 transition-all peer-placeholder-shown:translate-y-2 peer-placeholder-shown:text-[15px] peer-focus:-translate-y-1 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary">
                Username
              </span>
            </div>
            {errors.username ? <p className="mt-2 text-xs font-medium text-red-600">{errors.username.message}</p> : null}
          </label>

          <label className="group relative block">
            <span className="sr-only">Password</span>
            <div className="auth-input relative rounded-[22px] border border-slate-200 bg-white/90 px-4 pb-3 pt-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-transform duration-200 focus-within:-translate-y-0.5">
              <Lock className="pointer-events-none absolute right-4 top-4 h-4 w-4 text-slate-400" />
              <input
                {...register("password")}
                id="password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                placeholder=" "
                className="peer w-full bg-transparent pt-4 pr-11 text-[15px] font-medium text-slate-900 outline-none placeholder:text-transparent"
                aria-invalid={Boolean(errors.password)}
              />
              <span className="auth-floating-label pointer-events-none absolute left-4 top-4 text-sm text-slate-500 transition-all peer-placeholder-shown:translate-y-2 peer-placeholder-shown:text-[15px] peer-focus:-translate-y-1 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary">
                Password
              </span>
              <button
                type="button"
                onClick={() => setShowPassword((state) => !state)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password ? <p className="mt-2 text-xs font-medium text-red-600">{errors.password.message}</p> : null}
          </label>

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="inline-flex items-center gap-2 text-slate-600">
              <input type="checkbox" {...register("rememberMe")} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
              Remember me
            </label>
            <Link href="/forgot-password" className="font-medium text-primary transition-colors hover:text-[#0E4F75]">
              Forgot password?
            </Link>
          </div>

          <RippleButton
            type="submit"
            loading={loading}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-r from-[#0B3C5D] via-[#0E4F75] to-[#06263C] px-5 py-4 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(11,60,93,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_52px_rgba(11,60,93,0.34)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                Signing You In
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-[auth-dots_1.2s_infinite] rounded-full bg-white/90" />
                  <span className="h-1.5 w-1.5 animate-[auth-dots_1.2s_0.15s_infinite] rounded-full bg-white/90" />
                  <span className="h-1.5 w-1.5 animate-[auth-dots_1.2s_0.3s_infinite] rounded-full bg-white/90" />
                </span>
              </span>
            ) : (
              "Login"
            )}
          </RippleButton>


        </form>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary transition-colors hover:text-[#0E4F75]">
            Create Member Account
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
