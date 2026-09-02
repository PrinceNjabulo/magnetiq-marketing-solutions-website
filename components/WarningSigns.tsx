"use client";

import { motion } from "framer-motion";
import { warningSigns } from "@/lib/content";
import { iconMap } from "@/lib/icons";
import { EyebrowLine, RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function WarningSigns() {
  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <EyebrowLine className="text-brand-blue">{warningSigns.eyebrow}</EyebrowLine>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          {warningSigns.heading}
        </h2>

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-3">
          {warningSigns.items.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <RevealItem key={item.title}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-full rounded-2xl bg-gradient-to-br from-navy to-navy-deep p-7 shadow-card"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-blue/40 text-brand-blue">
                    {Icon && <Icon className="h-5 w-5" strokeWidth={2} />}
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{item.body}</p>
                </motion.div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
