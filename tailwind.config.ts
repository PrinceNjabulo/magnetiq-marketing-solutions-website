import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0a1a33",
          light: "#122544",
          deep: "#060f20",
        },
        cream: {
          DEFAULT: "#f5f2ea",
          card: "#ffffff",
        },
        brand: {
          blue: "#3b82f6",
          green: "#22c55e",
          "green-dark": "#16a34a",
          orange: "#f97316",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(59,130,246,0.45)",
        "glow-green": "0 0 40px -10px rgba(34,197,94,0.5)",
        card: "0 8px 30px -12px rgba(10,26,51,0.18)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 1px 1px, rgba(10,26,51,0.08) 1px, transparent 0)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { boxShadow: "0 0 0px 0px rgba(34,197,94,0.0)" },
          "50%": { boxShadow: "0 0 55px 6px rgba(34,197,94,0.28)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(-1.5%,1.5%,0) scale(1.03)" },
        },
      },
      animation: {
        breathe: "breathe 3.2s ease-in-out infinite",
        drift: "drift 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
