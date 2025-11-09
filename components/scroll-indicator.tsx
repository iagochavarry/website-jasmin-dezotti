"use client";

import { useState, useEffect, useRef } from "react";

interface ScrollIndicatorProps {
  text?: string;
}

export default function ScrollIndicator({ text = "Sobre Jasmin Dezzoti" }: ScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = indicatorRef.current;
    if (!element) return;

    // Usa Intersection Observer para detectar quando o elemento entra na viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Aparece quando o elemento está visível (pelo menos 10% visível)
          setIsVisible(entry.isIntersecting && entry.intersectionRatio > 0.1);
        });
      },
      {
        threshold: [0, 0.1, 0.5, 1], // Múltiplos thresholds para melhor detecção
        rootMargin: "-50px 0px -50px 0px", // Margem para desaparecer antes de sair completamente
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={indicatorRef}
      className={`flex justify-center py-8 md:py-12 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <span className="text-sm text-[var(--color-text-muted)] font-medium tracking-wide">
          {text}
        </span>
        <svg
          className="w-5 h-5 text-[var(--color-primary)]"
          style={{
            animation: "gentleFloat 2.5s ease-in-out infinite",
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </div>
  );
}
