import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Hero from "@/sections/Hero"
import Statistics from "@/sections/Statistics"
import Services from "@/sections/Services"
import WhyChoose from "@/sections/WhyChoose"
import HowItWorks from "@/sections/HowItWorks"
import LoanCalculator from "@/sections/LoanCalculator"
import DashboardPreview from "@/sections/DashboardPreview"
import Testimonials from "@/sections/Testimonials"
import FinancialEducation from "@/sections/FinancialEducation"
import News from "@/sections/News"
import Partners from "@/sections/Partners"
import FAQ from "@/sections/FAQ"
import CTA from "@/sections/CTA"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Statistics />
        <Services />
        <WhyChoose />
        <HowItWorks />
        <LoanCalculator />
        <DashboardPreview />
        <Testimonials />
        <FinancialEducation />
        <News />
        <Partners />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
