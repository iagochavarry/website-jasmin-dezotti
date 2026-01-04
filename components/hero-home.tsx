"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import VideoThumb from "@/public/images/hero-image-01.jpg";
import Logo from "@/public/images/LogoStyledHD-NoBG.png";

export default function HeroHome() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Gradiente sutil de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-background-primary)] via-[var(--color-background-primary)] to-[var(--color-secondary)]/5 -z-10"></div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Content wrapper - matches About section width */}
          <div className="mx-auto max-w-5xl">
            {/* ROW 1: Brand Bar - Centered on desktop, left on mobile */}
            <div className="flex flex-col items-start md:items-center justify-center mb-10 md:mb-12">
              <div className="flex items-center gap-4 md:gap-6">
                <Image
                  src={Logo}
                  alt="Logo Dra. Jasmin Dezotti"
                  width={132}
                  height={132}
                  className="w-[80px] h-[80px] md:w-[123px] md:h-[123px] object-contain flex-shrink-0"
                  priority
                />
                <div className="text-left">
                  <h1 className="bg-[linear-gradient(135deg,var(--color-primary),var(--color-secondary))] bg-clip-text font-nacelle text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-transparent [-webkit-background-clip:text] leading-tight">
                    Dra. Jasmin Dezotti Lovisi
                  </h1>
                  <p className="text-sm md:text-xl text-[var(--color-text-secondary)] mt-1 md:mt-2">
                    Otorrinolaringologista <span className="text-[var(--color-primary)]/60">•</span> CRM 52125602-5
                  </p>
                </div>
              </div>
            </div>

            {/* ROW 2: Two columns - Value Proposition + Image */}
            <div className="grid gap-12 md:grid-cols-5 md:gap-16 md:items-start">
              {/* Left: Value Proposition */}
              <div className="md:col-span-3 text-center md:text-left flex flex-col">
                <h2
                  className="font-nacelle text-xl md:text-2xl lg:text-3xl font-medium text-[var(--color-text-primary)] leading-snug mb-4"
                  data-aos="fade-up"
                  data-aos-delay={100}
                >
                  Excelência para sua{" "}
                  <span className="text-[var(--color-primary)]">saúde respiratória</span>
                </h2>
                <p
                  className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-6"
                  data-aos="fade-up"
                  data-aos-delay={150}
                >
                  Atendimento dedicado com foco em diagnóstico preciso e tratamentos personalizados.
                </p>

                {/* Professional Highlights */}
                <div className="mb-6 space-y-2" data-aos="fade-up" data-aos-delay={175}>
                  <div className="flex items-start gap-2">
                    <svg
                      className="mt-1 h-4 w-4 shrink-0 fill-[var(--color-primary)]"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 0L0 5l10 5 10-5-10-5zm0 13L3 9.5v4.25c0 1.5 3.134 2.75 7 2.75s7-1.25 7-2.75V9.5L10 13z" />
                    </svg>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      <span className="font-medium text-[var(--color-text-primary)]">Graduação:</span> Faculdade Souza Marques
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="mt-1 h-4 w-4 shrink-0 fill-[var(--color-primary)]"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 0L0 5l10 5 10-5-10-5zm0 13L3 9.5v4.25c0 1.5 3.134 2.75 7 2.75s7-1.25 7-2.75V9.5L10 13z" />
                    </svg>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      <span className="font-medium text-[var(--color-text-primary)]">Residência:</span> UERJ / HUPE
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="mt-1 h-4 w-4 shrink-0 fill-[var(--color-primary)]"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 0L0 5l10 5 10-5-10-5zm0 13L3 9.5v4.25c0 1.5 3.134 2.75 7 2.75s7-1.25 7-2.75V9.5L10 13z" />
                    </svg>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      <span className="font-medium text-[var(--color-text-primary)]">Especialização em Rinologia:</span> UERJ / HUPE <span className="text-[var(--color-primary)]/70 italic">(conclusão 04/27)</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg
                      className="mt-1 h-4 w-4 shrink-0 fill-[var(--color-primary)]"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 0L0 5l10 5 10-5-10-5zm0 13L3 9.5v4.25c0 1.5 3.134 2.75 7 2.75s7-1.25 7-2.75V9.5L10 13z" />
                    </svg>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      <span className="font-medium text-[var(--color-text-primary)]">Observership:</span> Cleveland Clinic em Pneumologia <span className="text-[var(--color-primary)]/70">(EUA)</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start mt-auto" data-aos="fade-up" data-aos-delay={200}>
                  <a
                    className="btn btn-primary shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                    href="/atendimento"
                  >
                    Agendar Consulta
                  </a>
                  <a
                    href="/#sobre"
                    className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    Conheça mais →
                  </a>
                </div>
              </div>

              {/* Right: Hero Image */}
              <div className="md:col-span-2 flex justify-center md:justify-end" data-aos="fade-left" data-aos-delay={200}>
                <div className="relative w-full max-w-[380px] overflow-hidden rounded-2xl shadow-lg border-2 border-white/60">
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/5 to-transparent z-10"></div>
                  <Image
                    src={VideoThumb}
                    alt="Dra. Jasmin Dezotti - Otorrinolaringologista"
                    width={380}
                    height={520}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile to avoid overlap with CTAs */}
      <div
        className={`hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-500 ${isScrolled ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
          }`}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-sm text-[var(--color-text-muted)] font-medium tracking-wide">
            Sobre a Dra. Jasmin
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
    </section>
  );
}
