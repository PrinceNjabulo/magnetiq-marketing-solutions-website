"use client";

import { motion } from "framer-motion";

const tints = [
  "rgba(59,130,246,0.35)", // blue
  "rgba(34,197,94,0.3)", // green
  "rgba(249,115,22,0.28)", // orange
  "rgba(59,130,246,0.35)",
  "rgba(34,197,94,0.3)",
  "rgba(249,115,22,0.28)",
];

const bars = [40, 65, 88, 60, 75, 50, 82, 46, 70, 58, 40, 30];

export function HeroBackground({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-navy">
      <motion.div
        className="absolute -right-1/4 top-0 h-full w-[85%] opacity-60 animate-drift"
        animate={{
          background: `radial-gradient(60% 60% at 60% 40%, ${tints[activeIndex % tints.length]}, transparent 70%)`,
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      <svg
        viewBox="0 0 800 500"
        className="absolute right-[-5%] top-1/2 h-[110%] w-[75%] -translate-y-1/2 opacity-[0.55] sm:opacity-70"
        preserveAspectRatio="xMidYMid slice"
      >
        <line x1="40" y1="440" x2="780" y2="440" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        {bars.map((h, i) => (
          <motion.rect
            key={i}
            x={60 + i * 60}
            width={26}
            rx={4}
            fill="url(#bar-gradient)"
            initial={{ height: 0, y: 440 }}
            animate={{ height: h * 4, y: 440 - h * 4 }}
            transition={{ duration: 1, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        <motion.path
          d="M60 380 C 160 300, 220 340, 300 260 S 460 180, 540 220 S 700 160, 760 120"
          fill="none"
          stroke="rgba(249,115,22,0.75)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, delay: 0.3, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="rgba(59,130,246,0.15)" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-transparent" />
    </div>
  );
}
