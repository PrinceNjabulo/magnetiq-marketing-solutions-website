"use client";

import { Quote } from "lucide-react";
import { testimonials } from "@/lib/content";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function Testimonials() {
  return (
    <section className="bg-navy px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow flex items-center justify-center gap-2 text-brand-orange/80">
            {testimonials.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {testimonials.heading}
          </h2>
        </div>

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-3">
          {testimonials.items.map((t) => (
            <RevealItem key={t.quote}>
              <div className="h-full rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
                <Quote className="h-6 w-6 text-brand-blue" strokeWidth={2} />
                <p className="mt-4 text-sm leading-relaxed text-white/80">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/50">{t.role}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal delay={0.1}>
          <p className="mt-6 text-center text-xs text-white/30">
            Placeholder quotes — swap in real client reviews once available.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
