export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
      <path
        d="M11 28V12l9 9 9-9v16"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#0a1a33" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <div className="leading-tight">
        <div
          className={`font-display font-semibold text-base tracking-tight sm:text-lg ${
            light ? "text-white" : "text-navy"
          }`}
        >
          MagnetiQ <span className="hidden font-normal opacity-70 sm:inline">Marketing</span>
        </div>
        <div
          className={`eyebrow hidden !text-[9px] !tracking-[0.18em] sm:block ${
            light ? "text-white/50" : "text-navy/50"
          }`}
        >
          Where strategy meets impact
        </div>
      </div>
    </div>
  );
}
