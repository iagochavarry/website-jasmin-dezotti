"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import AmilLogo from "@/public/images/amil.png";
import BradescoLogo from "@/public/images/bradesco.png";
import SulamericaLogo from "@/public/images/sulamerica.png";
import BancoCentralLogo from "@/public/images/Banco-central-do-brasil.png";
import BndesLogo from "@/public/images/bndes.png";
import CareplusLogo from "@/public/images/careplus.png";
import GoldenCrossLogo from "@/public/images/golden-crosspng.png";
import SaudePetrobrasLogo from "@/public/images/saude-petrobras.png";
import ValeLogo from "@/public/images/vale.png";

const healthPlans = [
    { logo: AmilLogo, alt: "Amil" },
    { logo: BradescoLogo, alt: "Bradesco Saúde" },
    { logo: SulamericaLogo, alt: "SulAmérica" },
    { logo: BancoCentralLogo, alt: "Banco Central do Brasil" },
    { logo: BndesLogo, alt: "BNDES" },
    { logo: CareplusLogo, alt: "Care Plus" },
    { logo: GoldenCrossLogo, alt: "Golden Cross" },
    { logo: SaudePetrobrasLogo, alt: "Saúde Petrobras" },
    { logo: ValeLogo, alt: "Vale" },
];

export default function HealthPlansCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isAutoScrolling, setIsAutoScrolling] = useState(true);

    useEffect(() => {
        if (!isAutoScrolling) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % healthPlans.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isAutoScrolling]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = 224; // 200px (min-w) + 24px (gap)
            const scrollPosition = currentIndex * cardWidth;
            container.scrollTo({
                left: scrollPosition,
                behavior: "smooth",
            });
        }
    }, [currentIndex]);

    const handlePrev = () => {
        setIsAutoScrolling(false);
        setCurrentIndex((prev) => (prev - 1 + healthPlans.length) % healthPlans.length);
    };

    const handleNext = () => {
        setIsAutoScrolling(false);
        setCurrentIndex((prev) => (prev + 1) % healthPlans.length);
    };

    return (
        <div className="relative max-w-4xl mx-auto">
            {/* Navigation Buttons */}
            <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-[var(--color-accent)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all duration-300"
                aria-label="Anterior"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-[var(--color-accent)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-all duration-300"
                aria-label="Próximo"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-hidden gap-6 pb-4 scrollbar-hide snap-x snap-mandatory"
                onMouseEnter={() => setIsAutoScrolling(false)}
                onMouseLeave={() => setIsAutoScrolling(true)}
            >
                {healthPlans.map((plan, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-center min-w-[200px] h-24 rounded-xl bg-white p-6 shadow-sm border border-[var(--color-accent)] hover:shadow-md transition-all duration-300 snap-center flex-shrink-0"
                    >
                        <Image
                            src={plan.logo}
                            alt={plan.alt}
                            width={120}
                            height={40}
                            className="object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 max-h-12 w-auto"
                        />
                    </div>
                ))}
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-4">
                {healthPlans.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setIsAutoScrolling(false);
                            setCurrentIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentIndex
                                ? "bg-[var(--color-primary)] w-6"
                                : "bg-[var(--color-accent)] hover:bg-[var(--color-primary)]/50"
                        }`}
                        aria-label={`Ir para plano ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

