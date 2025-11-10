"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import VideoThumb from "@/public/images/hero-image-01.jpg";

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
        {/* Hero content */}
        <div className="py-12 md:py-20">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-10 lg:gap-16">
            {/* Text content - Left side */}
            <div className="text-center md:text-left">
              <div className="mb-6">
                <h1
                  className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-3 font-nacelle text-3xl font-semibold text-transparent sm:text-4xl md:text-5xl lg:whitespace-nowrap mb-2"
                  data-aos="fade-up"
                  data-aos-delay={50}
                >
                  Dra. Jasmin Dezotti
                </h1>
                <p
                  className="text-lg text-[var(--color-text-primary)] font-medium mb-2 md:text-xl lg:whitespace-nowrap"
                  data-aos="fade-up"
                  data-aos-delay={100}
                >
                  Otorrinolaringologista
                </p>
                <p
                  className="text-sm text-[var(--color-text-secondary)] md:text-base lg:whitespace-nowrap"
                  data-aos="fade-up"
                  data-aos-delay={150}
                >
                  CRM 52125608-5 | Especialista em Rinologia
                </p>
              </div>
              <div className="mx-auto max-w-3xl md:mx-0">
                <p
                  className="mb-8 text-xl text-[var(--color-text-secondary)]"
                  data-aos="fade-up"
                  data-aos-delay={200}
                >
                  Cuidado de excelência e especializado para sua saúde respiratória.
                  Atendimento dedicado com foco em diagnóstico preciso e tratamentos personalizados.
                </p>
                <div className="mx-auto max-w-xs sm:max-w-none md:mx-0">
                  <div data-aos="fade-up" data-aos-delay={400}>
                    <a
                      className="btn btn-primary w-full sm:w-auto shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                      href="/atendimento"
                    >
                      Agendar Consulta
                    </a>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mt-3 text-center sm:text-left" data-aos="fade-up" data-aos-delay={500}>
                    Atendimento dedicado com foco no seu bem-estar
                  </p>
                </div>
              </div>
            </div>

            {/* Image - Right side */}
            <div className="flex justify-center md:justify-end" data-aos="fade-left" data-aos-delay={300}>
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl border-4 border-white/50 hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/10 to-transparent z-10"></div>
                <Image
                  src={VideoThumb}
                  alt="Dra. Jasmin Dezotti - Otorrinolaringologista"
                  width={400}
                  height={600}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-10 transition-all duration-500 ${isScrolled ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
          }`}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-sm text-[var(--color-text-muted)] font-medium tracking-wide">
            Sobre Jasmin Dezzoti
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
