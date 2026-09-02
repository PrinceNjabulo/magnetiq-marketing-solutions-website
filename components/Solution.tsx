"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { solution } from "@/lib/content";
import { EyebrowLine, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function Solution() {
  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <EyebrowLine className="text-brand-blue">{solution.eyebrow}</EyebrowLine>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          {solution.heading}
        </h2>

        <RevealGroup className="mt-10 grid gap-3 sm:grid-cols-2">
          {solution.items.map((text) => (
            <RevealItem key={text}>
              <motion.div
                whileHover={{ x: 4 }}
                className="flex items-start gap-3 rounded-xl bg-white p-5 shadow-card"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <p className="font-medium text-navy">{text}</p>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.15} className="mt-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-deep p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-blue/20 blur-3xl" />
            <EyebrowLine className="text-brand-blue/80">{solution.panelEyebrow}</EyebrowLine>
            <h3 className="relative mt-3 max-w-md font-display text-xl font-semibold text-white sm:text-2xl">
              {solution.panelHeading}
            </h3>
            <div className="relative mt-8 grid grid-cols-3 gap-4 sm:max-w-md">
              {[
                { label: "Organic reach", value: 68 },
                { label: "Page speed", value: 92 },
                { label: "Mobile score", value: 97 },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-green"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
