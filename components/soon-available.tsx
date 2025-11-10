"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/public/images/logo.png";

export default function SoonAvailable() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[var(--color-background-primary)] via-white to-[var(--color-background-secondary)]">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Floating shapes */}
                <div
                    className={`absolute top-20 left-10 h-64 w-64 rounded-full bg-[var(--color-secondary)]/10 blur-3xl transition-all duration-[2000ms] ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        }`}
                    style={{ animation: "float 8s ease-in-out infinite" }}
                />
                <div
                    className={`absolute bottom-20 right-10 h-96 w-96 rounded-full bg-[var(--color-primary)]/10 blur-3xl transition-all duration-[2000ms] delay-300 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        }`}
                    style={{ animation: "float 10s ease-in-out infinite reverse" }}
                />
                <div
                    className={`absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)]/20 blur-3xl transition-all duration-[2000ms] delay-500 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        }`}
                    style={{ animation: "float 12s ease-in-out infinite" }}
                />
            </div>

            {/* Main content */}
            <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
                <div
                    className={`max-w-4xl text-center transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                        }`}
                >
                    {/* Logo */}
                    <div className="mb-8 inline-flex items-center justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-[var(--color-primary)]/20 blur-2xl animate-pulse" />
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-[var(--color-accent)]">
                                <Image
                                    src={logo}
                                    alt="Logo Dra. Jasmin Dezotti"
                                    width={60}
                                    height={60}
                                    className="transition-transform duration-500 hover:scale-110"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Doctor Name with elegant gradient */}
                    <h1
                        className={`font-nacelle text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl mb-4 transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                    >
                        <span className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                            Dra. Jasmin Dezotti Lovisi
                        </span>
                    </h1>

                    {/* Specialty */}
                    <div
                        className={`mb-12 transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                    >
                        <span className="font-nacelle text-lg font-medium text-[var(--color-text-secondary)] sm:text-xl">
                            Otorrinolaringologista
                        </span>
                    </div>

                    {/* Construction message */}
                    <div
                        className={`mb-12 transition-all duration-1000 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                    >
                        <div className="mx-auto max-w-2xl">
                            <p className="font-nacelle text-xl leading-relaxed text-[var(--color-text-primary)] sm:text-2xl">
                                <span className="text-[var(--color-primary)] font-semibold">Site em construção</span>
                                <br />
                                <span className="text-[var(--color-text-secondary)]">
                                    Em breve, uma grande experiência médica
                                    <br />
                                    disponível no Rio de Janeiro
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Quality indicators */}
                    <div
                        className={`flex flex-wrap items-center justify-center gap-6 transition-all duration-1000 delay-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                    >
                        {/* Quality badge 1 */}
                        <div className="group flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-sm px-5 py-3 shadow-lg ring-1 ring-[var(--color-accent)] transition-all hover:shadow-xl hover:scale-105">
                            <svg
                                className="h-5 w-5 fill-[var(--color-primary)] transition-transform group-hover:rotate-12"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                Atendimento Humanizado
                            </span>
                        </div>

                        {/* Quality badge 2 */}
                        <div className="group flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-sm px-5 py-3 shadow-lg ring-1 ring-[var(--color-accent)] transition-all hover:shadow-xl hover:scale-105">
                            <svg
                                className="h-5 w-5 fill-[var(--color-secondary)] transition-transform group-hover:scale-110"
                                viewBox="0 0 24 24"
                            >
                                <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                Excelência Médica
                            </span>
                        </div>

                        {/* Quality badge 3 */}
                        <div className="group flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-sm px-5 py-3 shadow-lg ring-1 ring-[var(--color-accent)] transition-all hover:shadow-xl hover:scale-105">
                            <svg
                                className="h-5 w-5 fill-[var(--color-primary)] transition-transform group-hover:rotate-[-12deg]"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="text-sm font-medium text-[var(--color-text-primary)]">
                                Cuidado Personalizado
                            </span>
                        </div>
                    </div>

                    {/* Schedule button */}
                    <div
                        className={`mt-16 transition-all duration-1000 delay-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                    >
                        <a
                            href="https://wa.me/+5521997734282?text=Olá%2C%20gostaria%20de%20agendar%20uma%20consulta%20com%20a%20Dra.%20Jasmin%20Dezotti."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 rounded-full bg-[var(--color-primary)] px-8 py-4 font-medium text-white shadow-lg transition-all hover:bg-[var(--color-primary-dark)] hover:shadow-xl hover:scale-105"
                        >
                            <svg
                                className="h-5 w-5 fill-current transition-transform group-hover:scale-110"
                                viewBox="0 0 24 24"
                            >
                                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                            </svg>
                            <span>Agendar Consulta</span>
                        </a>
                    </div>

                    {/* Loading indicator */}
                    <div
                        className={`mt-12 transition-all duration-1000 delay-1200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <div
                                className="h-2 w-2 rounded-full bg-[var(--color-primary)]"
                                style={{ animation: "pulse 1.5s ease-in-out infinite" }}
                            />
                            <div
                                className="h-2 w-2 rounded-full bg-[var(--color-secondary)]"
                                style={{ animation: "pulse 1.5s ease-in-out 0.2s infinite" }}
                            />
                            <div
                                className="h-2 w-2 rounded-full bg-[var(--color-primary)]"
                                style={{ animation: "pulse 1.5s ease-in-out 0.4s infinite" }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom animations styles */}
            <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }

        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
      `}</style>
        </div>
    );
}

