"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import {
  ArrowLeft,
  ArrowRight,
  Check, CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  ShieldCheck,
  Upload,
} from "lucide-react"
import AuthShell from "@/components/auth/AuthShell"

const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "One number", test: (value: string) => /\d/.test(value) },
]

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required."),
    lastName: z.string().min(2, "Last name is required."),
    gender: z.string().min(1, "Gender is required."),
    dateOfBirth: z.string().min(1, "Date of birth is required."),
    nationalId: z.string().min(6, "National ID is required."),
    profilePhoto: z.string().optional(),
    phone: z.string().min(7, "Phone number is required."),
    email: z.string().email("Enter a valid email address."),
    district: z.string().min(2, "District is required."),
    sector: z.string().min(2, "Sector is required."),
    cell: z.string().min(2, "Cell is required."),
    village: z.string().min(2, "Village is required."),
    occupation: z.string().min(2, "Occupation is required."),
    employer: z.string().min(2, "Employer is required."),
    monthlyIncome: z.string().min(1, "Monthly income is required."),
    maritalStatus: z.string().min(1, "Marital status is required."),
    username: z.string().min(3, "Username is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8),
    securityQuestion: z.string().min(4, "Security question is required."),
    terms: z.boolean().refine((value) => value, { message: "You must accept the terms." }),
    nationalIdDocument: z.string().min(1, "Upload your national ID."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })

type RegisterValues = z.infer<typeof registerSchema>

const steps = [
  {
    title: "Personal Information",
    fields: ["firstName", "lastName", "gender", "dateOfBirth", "nationalId", "profilePhoto"] as const,
  },
  {
    title: "Contact",
    fields: ["phone", "email", "district", "sector", "cell", "village"] as const,
  },
  {
    title: "Employment",
    fields: ["occupation", "employer", "monthlyIncome", "maritalStatus"] as const,
  },
  {
    title: "Account",
    fields: ["username", "password", "confirmPassword", "securityQuestion", "terms"] as const,
  },
  {
    title: "Verification",
    fields: ["nationalIdDocument"] as const,
  },
] as const

const initialRegisterValues: RegisterValues = {
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  nationalId: "",
  profilePhoto: "",
  phone: "",
  email: "",
  district: "",
  sector: "",
  cell: "",
  village: "",
  occupation: "",
  employer: "",
  monthlyIncome: "",
  maritalStatus: "",
  username: "",
  password: "",
  confirmPassword: "",
  securityQuestion: "",
  terms: false,
  nationalIdDocument: "",
}

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

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Unable to read file."))
    reader.readAsDataURL(file)
  })
}

function passwordStrength(value: string) {
  const score = passwordRules.reduce((total, rule) => total + (rule.test(value) ? 1 : 0), 0)
  if (value.length < 8 || score <= 1) return { label: "Weak", color: "bg-red-500", suggestions: ["Use at least 8 characters.", "Mix letters, numbers and symbols."] }
  if (score === 2) return { label: "Medium", color: "bg-amber-500", suggestions: ["Add uppercase letters.", "Add a number or symbol."] }
  if (score === 3) return { label: "Strong", color: "bg-secondary", suggestions: ["Add one more unique character.", "Avoid repeated words."] }
  return { label: "Excellent", color: "bg-emerald-500", suggestions: ["Great password structure.", "Keep it unique to IAS."] }
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="group block">
      <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>
      {children}
      {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
    </label>
  )
}

function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`auth-input w-full rounded-[20px] border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 ${className}`}
    />
  )
}

function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`auth-input w-full rounded-[20px] border border-slate-200 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none ${className}`}
    />
  )
}

function MemberCard({ data }: { data: Partial<RegisterValues> }) {
  const initials = `${data.firstName?.[0] ?? "I"}${data.lastName?.[0] ?? "S"}`.toUpperCase()
  const memberId = `IAS-${String((data.username || data.firstName || "0000").slice(0, 4)).toUpperCase().padEnd(4, "X")}-${String(data.nationalId || "0000").slice(-4)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] border border-white/20 bg-gradient-to-br from-[#0B3C5D] via-[#0E4F75] to-[#06263C] p-5 text-white shadow-[0_24px_60px_rgba(11,60,93,0.28)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,180,0,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.18),transparent_26%)]" />
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/55">IAS Membership Card</p>
            <p className="mt-2 font-heading text-2xl font-bold">{data.firstName || "Your Name"} {data.lastName || ""}</p>
            <p className="mt-1 text-xs text-white/65">{memberId}</p>
          </div>
          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 text-lg font-bold">
            {data.profilePhoto ? <Image src={data.profilePhoto} alt="Profile preview" fill className="object-cover" unoptimized /> : initials}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Phone</p>
            <p className="mt-1 font-semibold">{data.phone || "+250 7XX XXX XXX"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">District</p>
            <p className="mt-1 font-semibold">{data.district || "Kigali"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Occupation</p>
            <p className="mt-1 font-semibold">{data.occupation || "Member"}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Monthly Income</p>
            <p className="mt-1 font-semibold">{data.monthlyIncome || "RWF"}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs text-white/65 backdrop-blur-md">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Verified member profile
          </span>
          <span>Premium digital onboarding</span>
        </div>
      </div>
    </motion.div>
  )
}

function SuccessView() {
  const confetti = [
    ["left-10 top-10", "bg-accent", 0],
    ["right-14 top-12", "bg-secondary", 0.1],
    ["left-16 bottom-10", "bg-white", 0.2],
    ["right-24 bottom-14", "bg-accent", 0.3],
    ["left-1/2 top-8", "bg-emerald-400", 0.15],
    ["left-1/4 bottom-8", "bg-sky-400", 0.25],
  ] as const

  return (
    <div className="relative flex min-h-[420px] flex-col items-center justify-center text-center sm:min-h-[620px]">
      {confetti.map(([position, color, delay], index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, scale: 0.4, y: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.8], y: [-20, -60, -100] }}
          transition={{ duration: 2.8, repeat: Infinity, delay, ease: "easeOut" }}
          className={`absolute h-3 w-3 rounded-full ${position} ${color} blur-[0.2px]`}
        />
      ))}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-50"
      >
        <CheckCircle2 className="h-20 w-20 text-emerald-500" />
        <span className="absolute inset-0 rounded-full border border-emerald-200/80 animate-ping" />
      </motion.div>
      <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-900">Congratulations!</h2>
      <p className="mt-4 max-w-md text-base leading-8 text-slate-500">
        Your IAS account has been successfully created.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/login" className="rounded-[20px] bg-gradient-to-r from-[#0B3C5D] to-[#0E4F75] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(11,60,93,0.25)] transition-all hover:-translate-y-0.5">
          Go to Login
        </Link>
        <Link href="/" className="rounded-[20px] border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-300">
          Back to Homepage
        </Link>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setValue,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: initialRegisterValues,
  })

  const values = useWatch({ control, defaultValue: initialRegisterValues }) ?? initialRegisterValues
  const strength = useMemo(() => passwordStrength(values.password || ""), [values.password])
  const currentStep = steps[step]
  const canMoveNext = async () => {
    const valid = await trigger([...currentStep.fields] as (keyof RegisterValues)[])
    if (!valid) toast.error("Please complete the highlighted fields.")
    return valid
  }

  const memberPreview = useMemo(
    () => ({
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      district: values.district,
      occupation: values.occupation,
      monthlyIncome: values.monthlyIncome,
      profilePhoto: values.profilePhoto,
      username: values.username,
      nationalId: values.nationalId,
    }),
    [values],
  )

  const onSubmit = async (payload: RegisterValues) => {
    setLoading(true)
    const pending = toast.loading("Creating your IAS membership...")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(data.error || "Registration failed.")
      toast.success("Your IAS account has been created.", { id: pending })
      setSuccess(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account.", { id: pending })
    } finally {
      setLoading(false)
    }
  }

  const handleFile = async (file: File | null, field: "profilePhoto" | "nationalIdDocument") => {
    if (!file) return
    if (field === "profilePhoto" && !file.type.startsWith("image/")) {
      toast.error("Please upload an image file.")
      return
    }
    try {
      const dataUrl = await fileToDataUrl(file)
      setValue(field, dataUrl, { shouldDirty: true, shouldValidate: true })
    } catch {
      toast.error("Failed to read the selected file.")
    }
  }

  return (
    <AuthShell
      badge="Trusted Financial Cooperative"
      title={<>Join IAS<br />Create Your<br />Financial Future</>}
      subtitle="Become a member through our secure digital onboarding process."
      panelClassName="max-w-[780px]"
      features={[
        { label: "Secure Registration" },
        { label: "Document Upload" },
        { label: "Live Preview" },
        { label: "Quick Approval" },
      ]}
      stats={[
        { value: 20000, suffix: "+", label: "Members" },
        { value: 45, suffix: "B RWF", label: "Savings" },
        { value: 98, suffix: "%", label: "Recovery" },
        { value: 25, suffix: "+", label: "Years" },
      ]}
    >
      {success ? (
        <SuccessView />
      ) : (
        <div className="space-y-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-[#0E4F75] text-[10px] font-bold text-white shadow-lg">
              IAS
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Ikimina Abanyamuryango Solidarity</p>
          </Link>

          <div className="space-y-3">
            <div className="flex items-center overflow-x-auto">
              {steps.map((item, index) => (
                <div key={item.title} className="flex flex-1 items-center">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                    index < step
                      ? "bg-primary text-white shadow-[0_4px_12px_rgba(11,60,93,0.25)]"
                      : index === step
                        ? "border-2 border-primary bg-white text-primary"
                        : "border border-slate-200 bg-white text-slate-400"
                  }`}>
                    {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </div>
                  {index < steps.length - 1 ? (
                    <div className={`mx-2 h-0.5 flex-1 rounded-full ${
                      index < step ? "bg-primary" : "bg-slate-200"
                    }`} />
                  ) : null}
                </div>
              ))}
            </div>
            <p className="text-center text-sm font-medium text-slate-700">
              Step {step + 1}. {steps[step].title}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.28 }}
                  className="space-y-6"
                >
                  {step === 0 ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="First Name" error={errors.firstName?.message}>
                          <Input {...register("firstName")} placeholder="Jean" />
                        </Field>
                        <Field label="Last Name" error={errors.lastName?.message}>
                          <Input {...register("lastName")} placeholder="Hakizimana" />
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Gender" error={errors.gender?.message}>
                          <Select {...register("gender")}>
                            <option value="">Select gender</option>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other</option>
                          </Select>
                        </Field>
                        <Field label="Date of Birth" error={errors.dateOfBirth?.message}>
                          <Input type="date" {...register("dateOfBirth")} />
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="National ID" error={errors.nationalId?.message}>
                          <Input {...register("nationalId")} placeholder="1199 1234 5678 9012" />
                        </Field>
                        <Field label="Profile Photo Upload" error={errors.profilePhoto?.message}>
                          <label className="flex cursor-pointer items-center justify-between rounded-[20px] border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 transition hover:border-primary hover:text-primary">
                            <span className="inline-flex items-center gap-2">
                              <ImagePlus className="h-4 w-4" />
                              {values.profilePhoto ? "Photo selected" : "Upload profile photo"}
                            </span>
                            <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0] ?? null, "profilePhoto")} />
                          </label>
                        </Field>
                      </div>
                    </>
                  ) : null}

                  {step === 1 ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Phone" error={errors.phone?.message}>
                          <Input {...register("phone")} placeholder="+250 7XX XXX XXX" />
                        </Field>
                        <Field label="Email" error={errors.email?.message}>
                          <Input type="email" {...register("email")} placeholder="you@example.com" />
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="District" error={errors.district?.message}>
                          <Input {...register("district")} placeholder="Gasabo" />
                        </Field>
                        <Field label="Sector" error={errors.sector?.message}>
                          <Input {...register("sector")} placeholder="Kimironko" />
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Cell" error={errors.cell?.message}>
                          <Input {...register("cell")} placeholder="Bibare" />
                        </Field>
                        <Field label="Village" error={errors.village?.message}>
                          <Input {...register("village")} placeholder="Akazuba" />
                        </Field>
                      </div>
                    </>
                  ) : null}

                  {step === 2 ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Occupation" error={errors.occupation?.message}>
                          <Input {...register("occupation")} placeholder="Entrepreneur" />
                        </Field>
                        <Field label="Employer" error={errors.employer?.message}>
                          <Input {...register("employer")} placeholder="Self-employed" />
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Monthly Income" error={errors.monthlyIncome?.message}>
                          <Input {...register("monthlyIncome")} placeholder="RWF 600,000" />
                        </Field>
                        <Field label="Marital Status" error={errors.maritalStatus?.message}>
                          <Select {...register("maritalStatus")}>
                            <option value="">Select status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </Select>
                        </Field>
                      </div>
                    </>
                  ) : null}

                  {step === 3 ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Username" error={errors.username?.message}>
                          <Input {...register("username")} placeholder="jeanh" />
                        </Field>
                        <Field label="Password" error={errors.password?.message}>
                          <div className="relative">
                            <Input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Create a strong password" className="pr-12" />
                            <button type="button" onClick={() => setShowPassword((state) => !state)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary" aria-label={showPassword ? "Hide password" : "Show password"}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Confirm Password" error={errors.confirmPassword?.message}>
                          <Input {...register("confirmPassword")} type={showPassword ? "text" : "password"} placeholder="Confirm password" />
                        </Field>
                        <Field label="Security Question" error={errors.securityQuestion?.message}>
                          <Input {...register("securityQuestion")} placeholder="What is your favorite school subject?" />
                        </Field>
                      </div>
                      <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-slate-700">Password Strength</span>
                          <span className="font-semibold text-slate-800">{strength.label}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div className={`h-full rounded-full ${strength.color}`} style={{ width: `${Math.max(passwordRules.reduce((n, rule) => n + (rule.test(values.password || "") ? 1 : 0), 0) * 25, 10)}%` }} />
                        </div>
                        <ul className="mt-3 space-y-1 text-xs text-slate-500">
                          {strength.suggestions.map((item) => <li key={item}>• {item}</li>)}
                        </ul>
                      </div>
                      <label className="flex items-start gap-3 rounded-[20px] border border-slate-200 bg-white/95 p-4 text-sm text-slate-600">
                        <input {...register("terms")} type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                        <span>
                          I agree to the IAS Terms and Conditions and consent to secure digital membership onboarding.
                        </span>
                      </label>
                      {errors.terms ? <p className="text-xs font-medium text-red-600">{errors.terms.message}</p> : null}
                    </>
                  ) : null}

                  {step === 4 ? (
                    <>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                        <h3 className="font-heading text-lg font-bold text-slate-900">Preview information</h3>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {[
                            ["Name", `${values.firstName || "-"} ${values.lastName || ""}`],
                            ["Username", values.username || "-"],
                            ["Phone", values.phone || "-"],
                            ["District", values.district || "-"],
                            ["Occupation", values.occupation || "-"],
                            ["Income", values.monthlyIncome || "-"],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-[18px] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
                              <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Field label="Upload National ID" error={errors.nationalIdDocument?.message}>
                        <label className="flex cursor-pointer items-center justify-between rounded-[20px] border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 transition hover:border-primary hover:text-primary">
                          <span className="inline-flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            {values.nationalIdDocument ? "National ID selected" : "Upload National ID"}
                          </span>
                          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0] ?? null, "nationalIdDocument")} />
                        </label>
                      </Field>
                    </>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep((value) => Math.max(value - 1, 0))}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </button>

                {step < steps.length - 1 ? (
                  <RippleButton
                    type="button"
                    onClick={async () => {
                      if (await canMoveNext()) setStep((value) => Math.min(value + 1, steps.length - 1))
                    }}
                    className="inline-flex items-center gap-2 rounded-[18px] bg-gradient-to-r from-[#0B3C5D] to-[#0E4F75] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(11,60,93,0.26)] transition hover:-translate-y-0.5"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </RippleButton>
                ) : (
                  <RippleButton
                    type="submit"
                    loading={loading}
                    className="inline-flex items-center gap-2 rounded-[18px] bg-gradient-to-r from-[#0B3C5D] to-[#16A34A] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(11,60,93,0.26)] transition hover:-translate-y-0.5 disabled:opacity-70"
                  >
                    Submit
                    {!loading ? <CheckCircle2 className="h-4 w-4" /> : null}
                  </RippleButton>
                )}
              </div>
            </form>

            <MemberCard data={memberPreview} />

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary transition-colors hover:text-[#0E4F75]">
              Back to Login
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  )
}
