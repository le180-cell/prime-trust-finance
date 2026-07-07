export interface NavLink {
  label: string
  href: string
}

export interface Stat {
  value: string
  suffix: string
  label: string
}

export interface Service {
  title: string
  description: string
  icon: string
}

export interface WhyChooseItem {
  title: string
  description: string
  icon: string
}

export interface Testimonial {
  name: string
  role: string
  quote: string
  rating: number
  image: string
}

export interface NewsItem {
  title: string
  date: string
  excerpt: string
  image: string
  slug: string
}

export interface LoanResult {
  monthlyPayment: number
  totalInterest: number
  totalRepayment: number
}
