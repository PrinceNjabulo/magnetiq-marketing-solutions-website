"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { brand } from "@/lib/content";
import { MagneticLink } from "@/components/motion/MagneticButton";

export function WhatsAppCTA({
  label,
  className = "",
  variant = "solid",
}: {
  label: string;
  className?: string;
  variant?: "solid" | "outline";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold transition-shadow";

  if (variant === "solid") {
    return (
      <MagneticLink
        href={brand.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-brand-green text-navy shadow-glow-green hover:shadow-[0_0_60px_-6px_rgba(34,197,94,0.65)] ${className}`}
      >
        <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
        {label}
      </MagneticLink>
    );
  }

  return (
    <motion.a
      href={brand.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} border-2 border-navy/20 text-navy hover:border-navy/40 ${className}`}
    >
      {label}
    </motion.a>
  );
}

export function FloatingWhatsApp() {
  return (
    <>
      <motion.a
        href={brand.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 hidden sm:flex h-14 w-14 items-center justify-center rounded-full bg-brand-green text-navy shadow-glow-green animate-breathe"
      >
        <MessageCircle className="h-7 w-7" strokeWidth={2.5} />
      </motion.a>

      {/* Sticky mobile bottom CTA bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden border-t border-navy/10 bg-cream/95 backdrop-blur px-4 py-3"
      >
        <a
          href={brand.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-green py-3 font-semibold text-navy"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
          Book Free Consultation
        </a>
      </motion.div>
    </>
  );
}
