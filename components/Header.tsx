"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Logo } from "@/components/Logo";
import { WhatsAppCTA } from "@/components/WhatsAppButton";
import { whatsappLink, whatsappMessages } from "@/lib/content";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 16);
  });

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/80 backdrop-blur-md shadow-card border-b border-navy/5"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
        <a href="#top">
          <Logo light={!scrolled} />
        </a>
        <a
          href={whatsappLink(whatsappMessages.consultation)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Book Free Consultation on WhatsApp"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-navy shadow-glow-green sm:hidden"
        >
          <MessageCircle className="h-5 w-5" strokeWidth={2.5} />
        </a>
        <div className="hidden items-center gap-6 sm:flex">
          <a
            href="/audit"
            className={`text-sm font-semibold transition-colors ${
              scrolled ? "text-navy/70 hover:text-navy" : "text-white/80 hover:text-white"
            }`}
          >
            Free Website Audit
          </a>
          <WhatsAppCTA
            label="Book Free Consultation"
            message={whatsappMessages.consultation}
            className="!px-6 !py-3"
          />
        </div>
      </div>
    </motion.header>
  );
}
