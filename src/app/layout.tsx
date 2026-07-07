import type { Metadata } from "next"
import { Poppins, Inter } from "next/font/google"
import "./globals.css"
import LenisProvider from "@/components/LenisProvider"
import ToastProvider from "@/components/ToastProvider"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { ThemeProvider } from "@/contexts/ThemeContext"

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "IAS | Ikimina Abavandimwe Solidarity — Trusted Savings & Loans",
  description:
    "Empowering members through secure savings and affordable loans. Join thousands of members growing their financial future with Ikimina Abavandimwe Solidarity.",
  keywords: ["savings", "loans", "cooperative", "Rwanda", "financial services", "IAS"],
  openGraph: {
    title: "IAS | Ikimina Abavandimwe Solidarity — Trusted Savings & Loans",
    description:
      "Empowering members through secure savings and affordable loans.",
    type: "website",
    locale: "en_RW",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
    shortcut: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full font-sans antialiased">
        <div className="relative z-10">
          <ThemeProvider>
            <LanguageProvider>
              <LenisProvider>
                {children}
                <ToastProvider />
              </LenisProvider>
            </LanguageProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}
