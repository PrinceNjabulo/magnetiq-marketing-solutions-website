"use client";

import { motion } from "framer-motion";
import { whyChoose } from "@/lib/content";
import { iconMap } from "@/lib/icons";
import { EyebrowLine, Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function WhyChooseUs() {
  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <EyebrowLine className="text-brand-blue">{whyChoose.eyebrow}</EyebrowLine>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
          {whyChoose.heading}
        </h2>
        <p className="mt-3 text-navy/60">{whyChoose.subhead}</p>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyChoose.items.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <RevealItem key={item.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full rounded-xl bg-white p-6 shadow-card"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                    {Icon && <Icon className="h-5 w-5" strokeWidth={2} />}
                  </div>
                  <h3 className="mt-4 font-semibold text-navy">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy/60">{item.body}</p>
                </motion.div>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal delay={0.15} className="mt-14 text-center">
          <p className="font-mono text-sm text-navy/50">
            Not just a website —{" "}
            <span className="font-semibold text-navy">a lead-generation tool built for your business.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
