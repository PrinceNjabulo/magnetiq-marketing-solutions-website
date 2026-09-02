"use client";

import { AnimatePresence, motion } from "framer-motion";
import { hero, niches } from "@/lib/content";
import { useRotator } from "@/lib/useRotator";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroRotator } from "@/components/HeroRotator";
import { WhatsAppCTA } from "@/components/WhatsAppButton";
import { EyebrowLine } from "@/components/motion/Reveal";
import { MagneticLink } from "@/components/motion/MagneticButton";

export function Hero() {
  const { index, paused, goTo, durationMs } = useRotator(niches.length);
  const active = niches[index];

  return (
    <section id="top" className="relative isolate flex min-h-[92vh] items-center overflow-hidden pt-24">
      <HeroBackground activeIndex={index} />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="max-w-2xl">
          <EyebrowLine className="text-brand-blue">{hero.eyebrow}</EyebrowLine>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {hero.headlinePrefix}{" "}
            <span className="relative inline-block h-[1.1em] overflow-hidden align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={active.id}
                  initial={{ y: "60%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-60%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block bg-gradient-to-r from-brand-blue to-sky-300 bg-clip-text text-transparent"
                >
                  {active.word}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/70"
          >
            {hero.subhead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <WhatsAppCTA label={hero.primaryCta} />
            <MagneticLink
              href="#pricing"
              className="rounded-full border-2 border-white/25 px-6 py-3.5 font-semibold text-white transition-colors hover:border-white/50"
            >
              {hero.secondaryCta}
            </MagneticLink>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="eyebrow mt-6 text-white/40"
          >
            {hero.trustLine}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-10"
          >
            <p className="eyebrow mb-3 text-white/40">Tap to see who we build for</p>
            <HeroRotator
              items={niches}
              activeIndex={index}
              paused={paused}
              durationMs={durationMs}
              onSelect={goTo}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
