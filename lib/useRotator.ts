"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useRotator(count: number, durationMs = 4200, resumeDelayMs = 6000) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, durationMs);
    return () => clearInterval(id);
  }, [paused, count, durationMs]);

  const goTo = useCallback(
    (i: number) => {
      setIndex(i);
      setPaused(true);
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
      resumeTimeout.current = setTimeout(() => setPaused(false), resumeDelayMs);
    },
    [resumeDelayMs],
  );

  useEffect(() => {
    return () => {
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    };
  }, []);

  return { index, paused, goTo, durationMs };
}
