export const brand = {
  name: "MagnetiQ",
  fullName: "MagnetiQ Marketing",
  tagline: "Where strategy meets impact",
  whatsappNumber: "066 211 0962",
  whatsappHref: "https://wa.me/27662110962",
};

export type Niche = {
  id: string;
  label: string;
  word: string;
};

// Derived from the pricing tiers' own "Perfect for" copy, so the hero
// cycles through the exact audiences MagnetiQ already sells to.
export const niches: Niche[] = [
  { id: "workshop", label: "Workshop", word: "Workshop" },
  { id: "salon", label: "Salon", word: "Salon" },
  { id: "restaurant", label: "Restaurant", word: "Restaurant" },
  { id: "dealership", label: "Dealership", word: "Dealership" },
  { id: "practice", label: "Medical Practice", word: "Medical Practice" },
  { id: "retail", label: "Retail Store", word: "Retail Store" },
];

export const hero = {
  eyebrow: "Where strategy meets impact",
  headlinePrefix: "Get More Customers for Your",
  subhead:
    "Professional websites that help local businesses attract more bookings — built to show up on Google, load fast on mobile, and turn visitors into WhatsApp enquiries.",
  primaryCta: "Book Free Consultation",
  secondaryCta: "See pricing",
  trustLine: "No contract lock-in · Reply within 1 business day · WhatsApp-first",
};

export const warningSigns = {
  eyebrow: "Warning signs",
  heading: "Still relying on Facebook?",
  items: [
    {
      icon: "Search",
      title: "Customers can't find you",
      body: "A Facebook page doesn't show up when someone searches \"near me\" — and that's where most of your customers are looking first.",
    },
    {
      icon: "Zap",
      title: "Competitors appear first on Google",
      body: "Businesses with a real website rank above yours, get the click, and get the enquiry — even if your work is better.",
    },
    {
      icon: "Plus",
      title: "You're losing business every day",
      body: "Every day without a proper online presence is another customer who called someone else instead of you.",
    },
  ],
};

export const solution = {
  eyebrow: "The fix",
  heading: "We'll build a professional website that:",
  items: [
    "Shows your services clearly, with prices if you want them listed",
    "Accepts enquiries directly from the page, day or night",
    "Works perfectly on mobile — where most customers will find you",
    "Appears on Google when locals search for what you offer",
    "Connects straight to WhatsApp so enquiries land where you already work",
  ],
  panelEyebrow: "Search visibility",
  panelHeading: "Built to rank, not just to look nice",
};

export type PricingTier = {
  id: string;
  eyebrow: string;
  name: string;
  description: string;
  price: string;
  featured?: boolean;
  features: string[];
  perfectFor: string;
  cta: string;
};

export const pricing: { eyebrow: string; heading: string; subhead: string; tiers: PricingTier[] } = {
  eyebrow: "Pricing plans",
  heading: "Simple, honest pricing",
  subhead:
    "Three packages built around where your business is right now — and where you want it to go.",
  tiers: [
    {
      id: "launch",
      eyebrow: "Launch package",
      name: "MagnetiQ Launch",
      description:
        "Perfect for startups and small businesses looking to establish a professional online presence.",
      price: "R999",
      features: [
        "1-Page professional website",
        "Mobile responsive design",
        "WhatsApp chat integration",
        "Contact form",
        "Google Maps integration",
        "Basic SEO setup",
        "Social media links",
        "1 revision · 5–7 day delivery",
      ],
      perfectFor: "new businesses, side hustles, freelancers, home-based businesses.",
      cta: "Get Online Today",
    },
    {
      id: "growth",
      eyebrow: "Growth package",
      name: "MagnetiQ Growth",
      description:
        "Designed for businesses ready to attract more customers and generate quality leads.",
      price: "R2,999",
      featured: true,
      features: [
        "Everything in Launch, plus:",
        "Up to 5 custom pages",
        "Google Business Profile setup",
        "Advanced on-page SEO",
        "AI-powered website chatbot",
        "Booking / quote request form",
        "Image gallery + testimonials",
        "Google Analytics + speed tuning",
        "30 days support · 2 revisions",
      ],
      perfectFor: "mechanics, construction, catering, salons, retail, professional services.",
      cta: "Grow My Business",
    },
    {
      id: "dominator",
      eyebrow: "Dominator package",
      name: "MagnetiQ Dominator",
      description:
        "For businesses serious about dominating their local market and building a powerful online presence.",
      price: "R5,999",
      features: [
        "Everything in Growth, plus:",
        "Up to 10 premium pages",
        "Complete local SEO + keyword research",
        "Search Console + blog/news section",
        "Lead-gen forms + CRM integration",
        "Advanced AI support chatbot",
        "Online appointment booking",
        "Monthly performance report",
        "90 days priority support · 3 revisions",
      ],
      perfectFor:
        "established businesses, dealerships, medical practices, restaurants, growing companies.",
      cta: "Own My Market",
    },
  ],
};

export const testimonials = {
  eyebrow: "Placeholder — swap in real reviews",
  heading: "What clients say",
  items: [
    {
      quote:
        "Since launching the new site we've had a steady stream of WhatsApp enquiries every week — it paid for itself in the first month.",
      name: "Local business owner",
      role: "Growth package client",
    },
    {
      quote:
        "We finally show up when people search for us on Google. Bookings are up and it looks so much more professional than our old Facebook page.",
      name: "Local business owner",
      role: "Dominator package client",
    },
    {
      quote:
        "Quick turnaround, no jargon, and the WhatsApp button means I never miss an enquiry, even after hours.",
      name: "Local business owner",
      role: "Launch package client",
    },
  ],
};

export const whyChoose = {
  eyebrow: "Every package includes",
  heading: "Why choose MagnetiQ?",
  subhead: "Built to generate leads, not just look good.",
  items: [
    {
      icon: "Smartphone",
      title: "Mobile-friendly design",
      body: "Looks and works great on every screen size.",
    },
    {
      icon: "Zap",
      title: "Fast loading website",
      body: "Optimised so visitors don't bounce before they see you.",
    },
    {
      icon: "ShieldCheck",
      title: "Secure SSL setup",
      body: "Every site is served securely, out of the box.",
    },
    {
      icon: "MessageCircle",
      title: "WhatsApp integration",
      body: "Enquiries land straight where you already work.",
    },
    {
      icon: "Search",
      title: "SEO-friendly structure",
      body: "Built so search engines can actually find you.",
    },
    {
      icon: "Sparkles",
      title: "Modern, professional design",
      body: "A site that matches the quality of your work.",
    },
    {
      icon: "User",
      title: "Expert support",
      body: "Real replies from a real person, on WhatsApp.",
    },
    {
      icon: "Plus",
      title: "Built to generate leads",
      body: "Every page has a clear next step for visitors.",
    },
  ],
  closingLine: "Not just a website — a lead-generation tool built for your business.",
};

export const footer = {
  mission:
    "Professional websites built for local businesses — attract more customers, look more credible, get more bookings.",
  ctaLine: "Ready to get your business online?",
  copyright: `© ${new Date().getFullYear()} MagnetiQ Marketing. All rights reserved.`,
  tagline: "Where strategy meets impact.",
};
