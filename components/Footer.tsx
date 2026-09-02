"use client";

import { footer, brand } from "@/lib/content";
import { Logo } from "@/components/Logo";
import { WhatsAppCTA } from "@/components/WhatsAppButton";
import { Reveal } from "@/components/motion/Reveal";

export function Footer() {
  return (
    <footer className="bg-navy px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <Logo light />
          <p className="mt-6 max-w-md text-white/60">{footer.mission}</p>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-white">{footer.ctaLine}</p>
            <WhatsAppCTA label={brand.whatsappNumber} />
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono">{footer.copyright}</p>
            <p className="font-mono">{footer.tagline}</p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
