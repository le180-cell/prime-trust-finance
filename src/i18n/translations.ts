export const locales = ["en", "fr", "rw"] as const
export type Locale = (typeof locales)[number]
export const localeNames: Record<Locale, string> = { en: "English", fr: "Français", rw: "Kinyarwanda" }

export type Translations = {
  nav: {
    home: string; about: string; services: string; loans: string
    savings: string; resources: string; news: string; contact: string
    memberLogin: string; becomeMember: string
  }
  hero: {
    badge: string
    heading: string[]
    abbreviation: string
    description: string
    primaryBtn: string
    secondaryBtn: string
    trust: string[]
    scrollText: string
  }
  stats: {
    badge: string; title: string; description: string
  }
  services: {
    badge: string; title: string; description: string; learnMore: string
  }
  whyChoose: {
    badge: string; title: string; description: string
    items: Array<{ title: string; description: string }>
  }
  howItWorks: {
    badge: string; title: string; description: string
    steps: Array<{ title: string; description: string }>
    stepLabel: string
  }
  loanCalc: {
    badge: string; title: string; description: string
    loanAmount: string; interestRate: string; duration: string
    monthlyPayment: string; totalInterest: string; totalRepayment: string
    principal: string; interest: string; applyNow: string; months: string
  }
  dashboardPreview: {
    badge: string; title: string; description: string
    memberPortal: string; searchPlaceholder: string; welcomeBack: string; financialSummary: string
    totalBalance: string; activeLoan: string; dividendsEarned: string; creditScore: string
    savingsGrowth: string; recentActivity: string; viewAll: string
    exploreDashboard: string
    activityItems: string[]
  }
  testimonials: {
    badge: string; title: string; description: string
  }
  financialEd: {
    badge: string; title: string; description: string
    cards: Array<{ title: string; description: string }>
    readGuide: string
  }
  news: {
    badge: string; title: string; description: string; readMore: string
  }
  partners: {
    badge: string
  }
  faq: {
    badge: string; title: string; description: string
    items: Array<{ question: string; answer: string }>
  }
  cta: {
    title: string; description: string; primaryBtn: string; secondaryBtn: string
  }
  footer: {
    description: string
    quickLinks: string; services: string; contactUs: string
    quickLinksItems: string[]; serviceItems: string[]
    newsletter: string; newsletterPlaceholder: string; subscribe: string; subscribed: string
    visitOffice: string; callUs: string
    rights: string
    privacy: string; terms: string; support: string
  }
  auth: {
    badge: string
    premiumSecurity: string
    loginTitle: string; loginSubtitle: string
    registerTitle: string; registerSubtitle: string
    forgotTitle: string; forgotSubtitle: string
    resetTitle: string; resetSubtitle: string
    features: string[]
  }
  dashboard: {
    greeting: string; greetingAfternoon: string; greetingEvening: string
    search: string; notifications: string; unread: string; noNotifications: string
    profile: string; settings: string; logout: string
    sidebar: string[]
  }
}

const en: Translations = {
  nav: {
    home: "Home", about: "About", services: "Services", loans: "Loans",
    savings: "Savings", resources: "Resources", news: "News", contact: "Contact",
    memberLogin: "Member Login", becomeMember: "Become a Member",
  },
  hero: {
    badge: "Trusted Cooperative Financial Institution",
    heading: ["IKIMINA", "ABANYAMURYANGO", "SOLIDARITY"],
    abbreviation: "(IAS)",
    description: "Empowering members through secure savings, accessible loans, financial transparency, and sustainable community development.",
    primaryBtn: "Become a Member",
    secondaryBtn: "Member Login",
    trust: ["Secure Savings", "Affordable Loans", "Transparent Management", "Trusted by Members"],
    scrollText: "Scroll to Explore",
  },
  stats: {
    badge: "Our Impact",
    title: "Trusted by Thousands of Members",
    description: "Ikimina Abavandimwe Solidarity (IAS) has been the cornerstone of financial empowerment for Rwandans.",
  },
  services: {
    badge: "What We Offer",
    title: "Comprehensive Financial Services",
    description: "From savings to loans, we provide all the financial tools you need to thrive.",
    learnMore: "Learn more",
  },
  whyChoose: {
    badge: "Why IAS",
    title: "Why Choose IAS",
    description: "We put our members first with trusted service, fast solutions, and a commitment to your financial well-being.",
    items: [
      { title: "Trusted Institution", description: "Serving our community with integrity, transparency, and financial excellence since 2026." },
      { title: "Fast Loan Processing", description: "Get approved quickly with our streamlined process. Funds disbursed within 24 hours." },
      { title: "Secure Digital Platform", description: "Your savings are protected with industry-leading security measures." },
      { title: "Dedicated Member Support", description: "Personalized support from our team of financial professionals." },
      { title: "Transparent Management", description: "Clear communication and transparent policies you can trust." },
      { title: "Financial Education", description: "Free resources and guidance to help you make informed decisions." },
    ],
  },
  howItWorks: {
    badge: "Simple Process",
    title: "Your Path to Financial Growth",
    description: "Follow these simple steps to unlock the full potential of your membership with IAS.",
    stepLabel: "Step",
    steps: [
      { title: "Join IAS", description: "Sign up online or visit our branch to become a member and start your financial journey." },
      { title: "Save Regularly", description: "Build your savings with consistent monthly contributions and watch your balance grow." },
      { title: "Apply for Loan", description: "Submit a loan application through your dashboard with just a few clicks." },
      { title: "Receive Approval", description: "Our team reviews your application quickly and provides a decision within days." },
      { title: "Achieve Financial Growth", description: "Use your loan and savings to invest, grow your business, and secure your future." },
    ],
  },
  loanCalc: {
    badge: "Loan Calculator",
    title: "Plan Your Loan",
    description: "Use our calculator to estimate your monthly payments and find the loan that fits your budget.",
    loanAmount: "Loan Amount (RWF)",
    interestRate: "Interest Rate (%)",
    duration: "Duration (Months)",
    monthlyPayment: "Monthly Payment",
    totalInterest: "Total Interest",
    totalRepayment: "Total Repayment",
    principal: "Principal",
    interest: "Interest",
    applyNow: "Apply Now",
    months: "months",
  },
  dashboardPreview: {
    badge: "Member Dashboard",
    title: "Your Financial Control Center",
    description: "Manage savings, track loans, view statements, and monitor your financial health — all in one place.",
    memberPortal: "Member Portal",
    searchPlaceholder: "Search...",
    welcomeBack: "Welcome back, Jean",
    financialSummary: "Here's your financial summary",
    totalBalance: "Total Balance",
    activeLoan: "Active Loan",
    dividendsEarned: "Dividends Earned",
    creditScore: "Credit Score",
    savingsGrowth: "Savings Growth",
    recentActivity: "Recent Activity",
    viewAll: "View all",
    exploreDashboard: "Explore Your Dashboard",
    activityItems: [
      "Savings deposit received",
      "Loan payment confirmed",
      "Dividend credited",
      "Goal milestone reached",
    ],
  },
  testimonials: {
    badge: "Testimonials",
    title: "What Our Members Say",
    description: "Hear from our valued members about their experience with IAS.",
  },
  financialEd: {
    badge: "Financial Education",
    title: "Learn & Grow",
    description: "Empower yourself with knowledge. Explore our financial literacy resources designed to help you make smarter money decisions.",
    cards: [
      { title: "Smart Saving Strategies", description: "Learn how to maximize your savings with disciplined approaches, automated contributions, and goal-based saving techniques that build real wealth over time." },
      { title: "Loan Management Guide", description: "Master the art of borrowing wisely. Understand interest rates, repayment strategies, and how to use loans as a tool for financial growth without over-leveraging." },
      { title: "Investment Advice", description: "Build long-term wealth with sound investment principles tailored for cooperative members seeking sustainable returns and financial independence." },
    ],
    readGuide: "Read Guide",
  },
  news: {
    badge: "Latest News",
    title: "News & Updates",
    description: "Stay informed with the latest news, updates, and financial tips from IAS.",
    readMore: "Read More",
  },
  partners: {
    badge: "Trusted Partners",
  },
  faq: {
    badge: "FAQ",
    title: "Got Questions? We've Got Answers",
    description: "Everything you need to know about IAS membership and services.",
    items: [
      { question: "How do I apply for a loan?", answer: "Navigate to the Loans section in your dashboard. Click 'Apply for Loan', fill in your details, and submit. Our team reviews applications within 2-3 business days." },
      { question: "When are dividends paid out?", answer: "Dividends are calculated at the end of each financial year based on your savings balance and contribution consistency. Payouts are processed in January." },
      { question: "How can I update my profile?", answer: "Go to Dashboard > Profile, edit your details, and click Save Changes. Email changes require additional verification." },
      { question: "What is the minimum monthly contribution?", answer: "The minimum monthly contribution is RWF 10,000, but we encourage saving more to maximize your dividend earnings and loan eligibility." },
      { question: "How do I download account statements?", answer: "Visit the Statements section in your dashboard, select a date range, and download in PDF or CSV format." },
      { question: "Can I have multiple savings goals?", answer: "Yes, you can create multiple goals with different targets and timelines directly from the Savings page." },
    ],
  },
  cta: {
    title: "Start Your Financial Journey Today",
    description: "Join Ikimina Abavandimwe Solidarity (IAS) and unlock secure savings, affordable loans, and a community dedicated to your financial success.",
    primaryBtn: "Become a Member",
    secondaryBtn: "Contact Us",
  },
  footer: {
    description: "Empowering members through secure savings and affordable loans. Your trusted financial partner in Rwanda.",
    quickLinks: "Quick Links",
    services: "Services",
    contactUs: "Contact Us",
    quickLinksItems: ["About Us", "Services", "Loans", "Savings", "News", "Contact"],
    serviceItems: ["Savings Accounts", "Loan Products", "Emergency Support", "Investments", "Digital Banking", "Member Portal"],
    newsletter: "Newsletter",
    newsletterPlaceholder: "Your email",
    subscribe: "Subscribe",
    subscribed: "✓",
    visitOffice: "Visit Our Office",
    callUs: "Call Us",
    rights: "© {year} Ikimina Abavandimwe Solidarity (IAS). All rights reserved.",
    privacy: "Privacy",
    terms: "Terms",
    support: "Support",
  },
  auth: {
    badge: "Member Portal",
    premiumSecurity: "Premium-grade security and member-first digital finance.",
    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to your account to manage savings, loans, and more.",
    registerTitle: "Create Your Account",
    registerSubtitle: "Join thousands of members building their financial future with IAS.",
    forgotTitle: "Reset Your Password",
    forgotSubtitle: "Enter your email and we'll send you a recovery link.",
    resetTitle: "Set New Password",
    resetSubtitle: "Choose a strong password for your account.",
    features: [
      "Secure digital platform",
      "24/7 account access",
      "Instant loan approvals",
      "Dividend earnings",
    ],
  },
  dashboard: {
    greeting: "Good Morning",
    greetingAfternoon: "Good Afternoon",
    greetingEvening: "Good Evening",
    search: "Search...",
    notifications: "Notifications",
    unread: "unread",
    noNotifications: "No notifications yet",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    sidebar: [
      "Dashboard", "My Savings", "My Loans", "Loan Applications",
      "My Payments", "My Receivables", "Penalties", "Digital Wallet",
      "Statements", "Activities", "Notifications", "Support",
      "Profile", "Settings", "Calendar",
    ],
  },
}

const fr: Translations = {
  nav: {
    home: "Accueil", about: "À propos", services: "Services", loans: "Prêts",
    savings: "Épargne", resources: "Ressources", news: "Actualités", contact: "Contact",
    memberLogin: "Connexion Membre", becomeMember: "Devenir Membre",
  },
  hero: {
    badge: "Institution Financière Coopérative de Confiance",
    heading: ["IKIMINA", "ABANYAMURYANGO", "SOLIDARITÉ"],
    abbreviation: "(IAS)",
    description: "Autonomiser les membres grâce à une épargne sécurisée, des prêts accessibles, la transparence financière et un développement communautaire durable.",
    primaryBtn: "Devenir Membre",
    secondaryBtn: "Connexion Membre",
    trust: ["Épargne Sécurisée", "Prêts Abordables", "Gestion Transparente", "Approuvé par les Membres"],
    scrollText: "Défiler pour Découvrir",
  },
  stats: {
    badge: "Notre Impact",
    title: "Approuvé par des Milliers de Membres",
    description: "Ikimina Abavandimwe Solidarity (IAS) est le pilier de l'autonomisation financière des Rwandais.",
  },
  services: {
    badge: "Ce Que Nous Offrons",
    title: "Services Financiers Complets",
    description: "De l'épargne aux prêts, nous fournissons tous les outils financiers dont vous avez besoin pour prospérer.",
    learnMore: "En savoir plus",
  },
  whyChoose: {
    badge: "Pourquoi IAS",
    title: "Pourquoi Choisir IAS",
    description: "Nous plaçons nos membres au premier plan avec un service de confiance, des solutions rapides et un engagement envers votre bien-être financier.",
    items: [
      { title: "Institution de Confiance", description: "Au service de notre communauté avec intégrité, transparence et excellence financière depuis 2026." },
      { title: "Traitement Rapide des Prêts", description: "Obtenez une approbation rapide grâce à notre processus simplifié. Fonds décaissés sous 24 heures." },
      { title: "Plateforme Numérique Sécurisée", description: "Votre épargne est protégée par des mesures de sécurité de pointe." },
      { title: "Support Membre Dédié", description: "Un accompagnement personnalisé par notre équipe de professionnels financiers." },
      { title: "Gestion Transparente", description: "Une communication claire et des politiques transparentes auxquelles vous pouvez faire confiance." },
      { title: "Éducation Financière", description: "Des ressources gratuites et des conseils pour vous aider à prendre des décisions éclairées." },
    ],
  },
  howItWorks: {
    badge: "Processus Simple",
    title: "Votre Chemin vers la Croissance Financière",
    description: "Suivez ces étapes simples pour libérer tout le potentiel de votre adhésion à IAS.",
    stepLabel: "Étape",
    steps: [
      { title: "Rejoindre IAS", description: "Inscrivez-vous en ligne ou visitez notre agence pour devenir membre et commencer votre parcours financier." },
      { title: "Épargner Régulièrement", description: "Construisez votre épargne avec des contributions mensuelles régulières et regardez votre solde croître." },
      { title: "Demander un Prêt", description: "Soumettez une demande de prêt via votre tableau de bord en quelques clics." },
      { title: "Recevoir l'Approbation", description: "Notre équipe examine votre demande rapidement et vous donne une décision sous quelques jours." },
      { title: "Atteindre la Croissance Financière", description: "Utilisez votre prêt et votre épargne pour investir, développer votre entreprise et sécuriser votre avenir." },
    ],
  },
  loanCalc: {
    badge: "Calculateur de Prêt",
    title: "Planifiez Votre Prêt",
    description: "Utilisez notre calculateur pour estimer vos mensualités et trouver le prêt qui correspond à votre budget.",
    loanAmount: "Montant du Prêt (RWF)",
    interestRate: "Taux d'Intérêt (%)",
    duration: "Durée (Mois)",
    monthlyPayment: "Paiement Mensuel",
    totalInterest: "Intérêt Total",
    totalRepayment: "Remboursement Total",
    principal: "Principal",
    interest: "Intérêt",
    applyNow: "Postuler Maintenant",
    months: "mois",
  },
  dashboardPreview: {
    badge: "Tableau de Bord Membre",
    title: "Votre Centre de Contrôle Financier",
    description: "Gérez votre épargne, suivez vos prêts, consultez vos relevés et surveillez votre santé financière — tout en un seul endroit.",
    memberPortal: "Portail Membre",
    searchPlaceholder: "Rechercher...",
    welcomeBack: "Bon retour, Jean",
    financialSummary: "Voici votre résumé financier",
    totalBalance: "Solde Total",
    activeLoan: "Prêt Actif",
    dividendsEarned: "Dividendes Gagnés",
    creditScore: "Score de Crédit",
    savingsGrowth: "Croissance de l'Épargne",
    recentActivity: "Activité Récente",
    viewAll: "Voir tout",
    exploreDashboard: "Explorer Votre Tableau de Bord",
    activityItems: [
      "Dépôt d'épargne reçu",
      "Paiement de prêt confirmé",
      "Dividende crédité",
      "Objectif atteint",
    ],
  },
  testimonials: {
    badge: "Témoignages",
    title: "Ce Que Disent Nos Membres",
    description: "Écoutez nos membres estimés partager leur expérience avec IAS.",
  },
  financialEd: {
    badge: "Éducation Financière",
    title: "Apprenez et Grandissez",
    description: "Autonomisez-vous avec des connaissances. Explorez nos ressources d'éducation financière conçues pour vous aider à prendre des décisions financières plus intelligentes.",
    cards: [
      { title: "Stratégies d'Épargne Intelligentes", description: "Apprenez à maximiser votre épargne avec des approches disciplinées, des contributions automatisées et des techniques d'épargne basées sur des objectifs." },
      { title: "Guide de Gestion des Prêts", description: "Maîtrisez l'art d'emprunter judicieusement. Comprenez les taux d'intérêt, les stratégies de remboursement et comment utiliser les prêts." },
      { title: "Conseils d'Investissement", description: "Construisez une richesse à long terme avec des principes d'investissement solides adaptés aux membres de coopératives." },
    ],
    readGuide: "Lire le Guide",
  },
  news: {
    badge: "Dernières Actualités",
    title: "Actualités et Mises à Jour",
    description: "Restez informé des dernières nouvelles, mises à jour et conseils financiers d'IAS.",
    readMore: "Lire Plus",
  },
  partners: {
    badge: "Partenaires de Confiance",
  },
  faq: {
    badge: "FAQ",
    title: "Des Questions ? Nous Avons des Réponses",
    description: "Tout ce que vous devez savoir sur l'adhésion à IAS et ses services.",
    items: [
      { question: "Comment demander un prêt ?", answer: "Accédez à la section Prêts dans votre tableau de bord. Cliquez sur 'Demander un prêt', remplissez vos informations et soumettez." },
      { question: "Quand les dividendes sont-ils versés ?", answer: "Les dividendes sont calculés à la fin de chaque exercice financier et versés en janvier." },
      { question: "Comment mettre à jour mon profil ?", answer: "Allez dans Tableau de Bord > Profil, modifiez vos informations et cliquez sur Enregistrer." },
      { question: "Quel est le montant minimum de contribution mensuelle ?", answer: "La contribution mensuelle minimale est de 10 000 RWF, mais nous encourageons à épargner plus." },
      { question: "Comment télécharger mes relevés ?", answer: "Visitez la section Relevés dans votre tableau de bord, sélectionnez une période et téléchargez en PDF ou CSV." },
      { question: "Puis-je avoir plusieurs objectifs d'épargne ?", answer: "Oui, vous pouvez créer plusieurs objectifs avec différents montants et échéances." },
    ],
  },
  cta: {
    title: "Commencez Votre Parcours Financier Aujourd'hui",
    description: "Rejoignez Ikimina Abavandimwe Solidarity (IAS) et accédez à une épargne sécurisée, des prêts abordables et une communauté dédiée à votre réussite financière.",
    primaryBtn: "Devenir Membre",
    secondaryBtn: "Contactez-Nous",
  },
  footer: {
    description: "Autonomiser les membres grâce à une épargne sécurisée et des prêts abordables. Votre partenaire financier de confiance au Rwanda.",
    quickLinks: "Liens Rapides",
    services: "Services",
    contactUs: "Contactez-Nous",
    quickLinksItems: ["À Propos", "Services", "Prêts", "Épargne", "Actualités", "Contact"],
    serviceItems: ["Comptes d'Épargne", "Produits de Prêt", "Soutien d'Urgence", "Investissements", "Banque Numérique", "Portail Membre"],
    newsletter: "Newsletter",
    newsletterPlaceholder: "Votre email",
    subscribe: "S'abonner",
    subscribed: "✓",
    visitOffice: "Visitez Notre Bureau",
    callUs: "Appelez-Nous",
    rights: "© {year} Ikimina Abavandimwe Solidarity (IAS). Tous droits réservés.",
    privacy: "Confidentialité",
    terms: "Conditions",
    support: "Support",
  },
  auth: {
    badge: "Portail Membre",
    premiumSecurity: "Sécurité haut de gamme et finance numérique axée sur les membres.",
    loginTitle: "Bon Retour",
    loginSubtitle: "Connectez-vous à votre compte pour gérer votre épargne, vos prêts et plus encore.",
    registerTitle: "Créez Votre Compte",
    registerSubtitle: "Rejoignez des milliers de membres qui construisent leur avenir financier avec IAS.",
    forgotTitle: "Réinitialisez Votre Mot de Passe",
    forgotSubtitle: "Entrez votre email et nous vous enverrons un lien de récupération.",
    resetTitle: "Définir un Nouveau Mot de Passe",
    resetSubtitle: "Choisissez un mot de passe fort pour votre compte.",
    features: [
      "Plateforme numérique sécurisée",
      "Accès au compte 24/7",
      "Approbations instantanées de prêts",
      "Gains de dividendes",
    ],
  },
  dashboard: {
    greeting: "Bonjour",
    greetingAfternoon: "Bon Après-Midi",
    greetingEvening: "Bonsoir",
    search: "Rechercher...",
    notifications: "Notifications",
    unread: "non lues",
    noNotifications: "Aucune notification",
    profile: "Profil",
    settings: "Paramètres",
    logout: "Déconnexion",
    sidebar: [
      "Tableau de Bord", "Mon Épargne", "Mes Prêts", "Demandes de Prêt",
      "Mes Paiements", "Mes Créances", "Pénalités", "Portefeuille Numérique",
      "Relevés", "Activités", "Notifications", "Support",
      "Profil", "Paramètres", "Calendrier",
    ],
  },
}

const rw: Translations = {
  nav: {
    home: "Ahabanza", about: "Ibyerekeye", services: "Serivisi", loans: "Inguzanyo",
    savings: "Kuzigama", resources: "Ibikoresho", news: "Amakuru", contact: "Twandikire",
    memberLogin: "Injira nk'Umunyamuryango", becomeMember: "Kuba Umunyamuryango",
  },
  hero: {
    badge: "Ikigo Cy'Imari Cyizerwa",
    heading: ["IKIMINA", "ABANYAMURYANGO", "SOLIDARITY"],
    abbreviation: "(IAS)",
    description: "Gushyigikira abanyamuryango binyuze mu kuzigama byizewe, inguzanyo zishoboka, ubwisanzure mu'imari, n'iterambere ry'abaturage rirambye.",
    primaryBtn: "Kuba Umunyamuryango",
    secondaryBtn: "Injira nk'Umunyamuryango",
    trust: ["Kuzigama Byizewe", "Inguzanyo Zihenze", "Ubucunga Busobanutse", "Izingirwa n'Abanyamuryango"],
    scrollText: "Kanda Ushire",
  },
  stats: {
    badge: "Ingaruka Zacu",
    title: "Izingirwa n'Abanyamuryango Ibihumbi",
    description: "Ikimina Abavandimwe Solidarity (IAS) ibaye urufatiro rw'ubushobozi bw'imari ku Banyarwanda.",
  },
  services: {
    badge: "Ibyo Dutanga",
    title: "Serivisi Z'imari Zuzuye",
    description: "Kuva mu kuzigama kugeza ku nguzanyo, duha ibikoresho by'imari ukeneye kugirango utere imbere.",
    learnMore: "Menya byinshi",
  },
  whyChoose: {
    badge: "Kuki IAS",
    title: "Kuki Ukwitoranya IAS",
    description: "Dushyira abanyamuryango bacu imbere hamwe na serivisi zizerwa, ibisubizo byihuse, n'ibyo twiyemeje ku buzima bwawe bw'imari.",
    items: [
      { title: "Ikigo Cyizerwa", description: "Gukorera abaturage bacu mu butabera, ubwisanzure, n'ubutaka bw'imari kuva 2026." },
      { title: "Gutanga Inguzanyo Byihuse", description: "Emererwa vuba kuri gahunda yacu yoroshye. Amafungu atangwa mu masaha 24." },
      { title: "Urubuga Rwawe Ruzizwe", description: "Ibyo uzigama birinzwe n'ingamba z'umutekano zihendeje." },
      { title: "Ubufasha Ku Banyamuryango", description: "Ubufasha bwihariye buva ku itsinda ry'abajyanama b'imari." },
      { title: "Ubucunga Busobanutse", description: "Itumanaho ryiza na politiki zisobanutse ushobora kwizera." },
      { title: "Uburezi mu'Imari", description: "Ibikoresho by'uburezi ku buntu n'ubuyobozi kugirango ufate ibyemezo byiza." },
    ],
  },
  howItWorks: {
    badge: "Inzira Yoroshye",
    title: "Inzira Yawe Yo Gukura mu'Imari",
    description: "Kurikiza izi ntambwe zoroshye kugirango ukoreshe neza ubunyamuryango bwawe muri IAS.",
    stepLabel: "Intambwe",
    steps: [
      { title: "Injira muri IAS", description: "Iyandikishe ku rubuga cyangwa usure ishami ryacu kugirango ube umunyamuryango." },
      { title: "Zigama Buri Gihe", description: "Ubake ubuzigama bwawe hamwe n'umusanzu buri kwezi kandi urebe uko atera imbere." },
      { title: "Saba Inguzanyo", description: "Ohereza icyifuzo cy'inguzanyo ukoresheje porogaramu yawe." },
      { title: "Emererwa", description: "Itsinda ryacu risuzuma icyifuzo cyawe byihuse kandi rigaha icyemezo mu minsi mike." },
      { title: "Gerageza Imbere mu'Imari", description: "Koresha inguzanyo yawe n'ubuzigama bwawe kugirango ushyire imari, ukure bizinesi yawe, kandi uteze impanuro." },
    ],
  },
  loanCalc: {
    badge: "Kubara Inguzanyo",
    title: "Tegura Inguzanyo Yawe",
    description: "Koresha ikibarwa cyacu kugirango umenyere amafaranga uha buri kwezi kandi ubone inguzanyo ikwiriye.",
    loanAmount: "Inguzanyo (RWF)",
    interestRate: "Inyungu (%)",
    duration: "Igihe (Amezi)",
    monthlyPayment: "Amafaranga buri Kwezi",
    totalInterest: "Inyungu Zose",
    totalRepayment: "Kwishura Byose",
    principal: "Inguzanyo",
    interest: "Inyungu",
    applyNow: "Saba Nonaha",
    months: "amezi",
  },
  dashboardPreview: {
    badge: "Porogaramu y'Umunyamuryango",
    title: "Ikigo cyawe cyo Kugenzura Imari",
    description: "Kunga ubuzigama, ukurikirane inguzanyo, urebe raporo, kandi ugenzure ubuzima bwawe bw'imari — byose ahagomba.",
    memberPortal: "Urubuga rw'Umunyamuryango",
    searchPlaceholder: "Shaka...",
    welcomeBack: "Murakaza neza, Jean",
    financialSummary: "Dore incamake y'imari yawe",
    totalBalance: "Amafaranga Yose",
    activeLoan: "Inguzanyo Ikora",
    dividendsEarned: "Imiturire Yabonetse",
    creditScore: "Ingano y'Inguzanyo",
    savingsGrowth: "Iterambere ry'Ubuzigama",
    recentActivity: "Ibikorwa Biheruka",
    viewAll: "Reba Byose",
    exploreDashboard: "Koresha Porogaramu Yawe",
    activityItems: [
      "Ubuzigama bwawe bwakiriwe",
      "Kwishura inguzanyo byemewe",
      "Imiturire yashyizwe",
      "Intego yagezweho",
    ],
  },
  testimonials: {
    badge: "Ibyo Abanyamuryango Bavuga",
    title: "Ibyo Abanyamuryango Bacu Bavuga",
    description: "Umunwa abanyamuryango bacu bagize kuri IAS.",
  },
  financialEd: {
    badge: "Uburezi mu'Imari",
    title: "Iga Kandi Ukure",
    description: "Ihaye ubushobozi n'ubumenyi. Shakisha ibikoresho byacu by'uburezi bw'imari byakugenewe kugufasha gufata ibyemezo by'ubwenge.",
    cards: [
      { title: "Ubushobozi bwo Kuzigama", description: "Menya uko wongera ubuzigama bwawe ukoresheje uburyo bwiza, umusanzu wikora, n'ubuhanga bwo kuzigama." },
      { title: "Ubuyobozi bw'Inguzanyo", description: "Menya ubutweri bwo kuguriza neza. Sobanukirwa inyungu, uburyo bwo kwishura, n'inguzanyo." },
      { title: "Inama yo Gushyira Imari", description: "Ubake ubukungu burambye hamwe n'amahame y'ubushoramari akwiye abanyamuryango." },
    ],
    readGuide: "Soma Ubuyobozi",
  },
  news: {
    badge: "Amakuru Mashya",
    title: "Amakuru n'Ibintu Bishya",
    description: "Menya ibintu bishya, amakuru, n'inama z'imari biturutse kuri IAS.",
    readMore: "Soma Byinshi",
  },
  partners: {
    badge: "Abafatanyabikorwa Bizerwa",
  },
  faq: {
    badge: "Ibibazo",
    title: "Ufite Ibibazo? Dufite Ibisubizo",
    description: "Ibyo wamenya byose kubyerekeye ubunyamuryango bwa IAS na serivisi zayo.",
    items: [
      { question: "Ndasaba inguzanyo nte?", answer: "Jya mu gice cy'Inguzanyo muri porogaramu yawe. Kanda 'Saba Inguzanyo', wuzuze ibisabwa, hanyuma wohereze." },
      { question: "Imiturire itangwa ryari?", answer: "Imiturire ibarwa mu mpera y'umwaka w'imari ishingiye ku buzigama bwawe kandi itangwa muri Mutarama." },
      { question: "Nshobora guhindura porofile yande?", answer: "Jya kuri Porogaramu > Porofile, hindura amakuru yawe, hanyuma ukande Kubika." },
      { question: "Ntego nkeya yo buri kwezi ni iyihe?", answer: "Ntego nkeya ni RWF 10,000, ariko dutera inkunga kuzigama byinshi." },
      { question: "Nkura raporo y'ikonti nde?", answer: "Sura igice cya Raporo muri porogaramu yawe, hitamo igihe, hanyuma ukure muri PDF cyangwa CSV." },
      { question: "Nshobora kugira intego nyinshi zo kuzigama?", answer: "Yego, ushobora gukora intego nyinshi zifite ingano n'ibihe bitandukanye." },
    ],
  },
  cta: {
    title: "Tangira Urugendo Rwawe mu'Imari Uyu Munsi",
    description: "Injira muri Ikimina Abavandimwe Solidarity (IAS) kandi ufungure ubuzigama bwizewe, inguzanyo zihenze, n'umuryango ujejwe gutsinda kwawe mu'imari.",
    primaryBtn: "Kuba Umunyamuryango",
    secondaryBtn: "Twandikire",
  },
  footer: {
    description: "Gushyigikira abanyamuryango binyuze mu kuzigama byizewe n'inguzanyo zihenze. Mufatanifatanyabikorwa w'iwizewe mu Rwanda.",
    quickLinks: "Ibyahuzo",
    services: "Serivisi",
    contactUs: "Twandikire",
    quickLinksItems: ["Ibyerekeye", "Serivisi", "Inguzanyo", "Kuzigama", "Amakuru", "Twandikire"],
    serviceItems: ["Konti zo Kuzigama", "Inguzanyo", "Ubufasha bw'Umwihariko", "Ubushoramari", "Banki ya Digitali", "Urubuga rw'Umunyamuryango"],
    newsletter: "Ibaruwa",
    newsletterPlaceholder: "Imeri yawe",
    subscribe: "Iyandikisha",
    subscribed: "✓",
    visitOffice: "Sura Ibiro Byacu",
    callUs: "Duhamagare",
    rights: "© {year} Ikimina Abavandimwe Solidarity (IAS). Uburenganzira bwose burabitswe.",
    privacy: "Ibanga",
    terms: "Amategeko",
    support: "Ubufasha",
  },
  auth: {
    badge: "Urubuga rw'Umunyamuryango",
    premiumSecurity: "Umutekano uhebuje na porogaramu y'imari yibanze ku munyamuryango.",
    loginTitle: "Murakaza Neza",
    loginSubtitle: "Injira kuri konte yawe kugirango ugere kuri serivisi zacu.",
    registerTitle: "Fungura Konte",
    registerSubtitle: "Injira mu banyamuryango ibihumbi bubaka ejo hazaza mu'imari hamwe na IAS.",
    forgotTitle: "Gusubiramo ijambo ry'ibanga",
    forgotSubtitle: "Shyiramo imeri yawe maze tuguhishurire link yo gusubiramo.",
    resetTitle: "Shyiraho Ijambo ry'ibanga Rishya",
    resetSubtitle: "Hitamo ijambo ry'ibanga rikomeye kuri konte yawe.",
    features: [
      "Urubuga rwawe ruzizwe",
      "Kugera kuri konte 24/7",
      "Inguzanyo zihuse",
      "Imiturire",
    ],
  },
  dashboard: {
    greeting: "Mwaramutse",
    greetingAfternoon: "Mwiriwe",
    greetingEvening: "Muraho",
    search: "Shaka...",
    notifications: "Amanotisi",
    unread: "ntibisomwe",
    noNotifications: "Nta manotisi",
    profile: "Porofile",
    settings: "Igenamiterere",
    logout: "Sohoka",
    sidebar: [
      "Porogaramu", "Ubuzigama Bwanjye", "Inguzanyo Zanjye", "Gusaba Inguzanyo",
      "Kwishura Kwanjye", "Icyo Nahawe", "Ihaza", "Ikifuka",
      "Raporo", "Ibikorwa", "Amanotisi", "Ubufasha",
      "Porofile", "Igenamiterere", "Kalendari",
    ],
  },
}

export const translations: Record<Locale, Translations> = { en, fr, rw }
