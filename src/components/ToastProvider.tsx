"use client"

import { Toaster } from "react-hot-toast"

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4500,
        style: {
          borderRadius: "18px",
          padding: "14px 16px",
          background: "rgba(255,255,255,0.92)",
          color: "#0f172a",
          boxShadow: "0 16px 50px rgba(11,60,93,0.16)",
          border: "1px solid rgba(15,23,42,0.08)",
        },
        success: {
          iconTheme: { primary: "#16A34A", secondary: "#ffffff" },
        },
        error: {
          iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
        },
      }}
    />
  )
}
