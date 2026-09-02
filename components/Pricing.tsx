"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { pricing, type PricingTier } from "@/lib/content";
import { WhatsAppCTA } from "@/components/WhatsAppButton";
import { EyebrowLine, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <RevealItem className={tier.featured ? "sm:-translate-y-4" : ""}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`relative flex h-full flex-col rounded-2xl p-8 ${
          tier.featured
            ? "bg-gradient-to-b from-navy to-navy-deep text-white shadow-glow animate-breathe"
            : "bg-white text-navy shadow-card"
        }`}
      >
        {tier.featured && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-orange px-4 py-1 text-xs font-bold uppercase tracking-wide text-white">
            Most popular
          </span>
        )}

        <EyebrowLine className={tier.featured ? "text-brand-blue/80" : "text-brand-blue"}>
          {tier.eyebrow}
        </EyebrowLine>
        <h3 className="mt-3 font-display text-2xl font-semibold">{tier.name}</h3>
        <p className={`mt-2 text-sm leading-relaxed ${tier.featured ? "text-white/60" : "text-navy/60"}`}>
          {tier.description}
        </p>

        <div className="mt-6">
          <span className="text-xs uppercase tracking-wide opacity-60">From</span>
          <div className="font-display text-4xl font-bold">{tier.price}</div>
        </div>

        <ul className="mt-6 flex-1 space-y-3">
          {tier.features.map((f) => {
            const isHeader = f.startsWith("Everything in");
            return (
              <li
                key={f}
                className={`flex items-start gap-2.5 text-sm ${
                  isHeader
                    ? `pt-1 font-mono text-xs uppercase tracking-wide ${
                        tier.featured ? "text-white/40" : "text-navy/40"
                      }`
                    : ""
                }`}
              >
                {!isHeader && (
                  <Check
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      tier.featured ? "text-brand-green" : "text-brand-blue"
                    }`}
                    strokeWidth={3}
                  />
                )}
                <span className={isHeader ? "" : tier.featured ? "text-white/85" : "text-navy/80"}>
                  {f}
                </span>
              </li>
            );
          })}
        </ul>

        <p className={`mt-6 text-xs leading-relaxed ${tier.featured ? "text-white/50" : "text-navy/50"}`}>
          <span className="font-semibold">Perfect for:</span> {tier.perfectFor}
        </p>

        <WhatsAppCTA label={tier.cta} className="mt-6 w-full" />
      </motion.div>
    </RevealItem>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <EyebrowLine className="justify-center text-brand-blue">{pricing.eyebrow}</EyebrowLine>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            {pricing.heading}
          </h2>
          <p className="mt-4 text-navy/60">{pricing.subhead}</p>
        </div>

        <RevealGroup className="mt-16 grid gap-6 sm:grid-cols-3">
          {pricing.tiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </RevealGroup>

        <Reveal delay={0.1} className="mt-16 overflow-x-auto rounded-2xl bg-white shadow-card">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-xs uppercase tracking-wide text-navy/50">
                <th className="px-6 py-4 font-mono font-normal">Package</th>
                <th className="px-6 py-4 font-mono font-normal">Price</th>
                <th className="px-6 py-4 font-mono font-normal">Best for</th>
              </tr>
            </thead>
            <tbody>
              {pricing.tiers.map((tier) => (
                <tr key={tier.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-6 py-4 font-semibold text-navy">{tier.name.replace("MagnetiQ ", "")}</td>
                  <td className="px-6 py-4 text-brand-blue font-semibold">From {tier.price}</td>
                  <td className="px-6 py-4 text-navy/60">{tier.perfectFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
