"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import HomeImg from "@/public/images/home.png";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === "/";

  const menuItems = [
    { href: "/#sobre", label: "Sobre" },
    { href: "/#servicos", label: "Serviços" },
    { href: "/#diferenciais", label: "Diferenciais" },
    { href: "/#depoimentos", label: "Depoimentos" },
    { href: "/blog", label: "Blog" },
  ];

  // Função para scroll suave com offset
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.substring(2);
      
      // Se não estiver na home, navegar para home primeiro
      if (!isHomePage) {
        router.push(`/#${targetId}`);
        return;
      }
      
      const element = document.getElementById(targetId);
      
      if (element) {
        const headerOffset = 100; // Offset para compensar header fixo
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  // Prevenir scroll do body quando menu estiver aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Scroll para seção quando página carrega com hash
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const element = document.getElementById(hash);
      
      if (element) {
        // Pequeno delay para garantir que a página carregou
        setTimeout(() => {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }, 100);
      }
    }
  }, [isHomePage, pathname]);

  return (
    <>
      {/* Overlay para fechar menu ao clicar fora */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      <header className="sticky top-0 z-50 w-full pt-2 md:pt-5 pb-2 bg-[var(--color-background-primary)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative flex h-16 items-center justify-between gap-6 rounded-2xl bg-white/95 px-6 shadow-md border border-[var(--color-accent)] backdrop-blur-sm">
            {/* Home logo - Top left */}
            <a
              href="/"
              className="flex items-center flex-shrink-0 z-10"
            >
              <Image
                src={HomeImg}
                alt="Home"
                width={40}
                height={40}
                className="object-contain"
              />
            </a>

            {/* Desktop navigation - Centered */}
            <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
              <a
                href="/#sobre"
                onClick={(e) => handleSmoothScroll(e, "/#sobre")}
                className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline underline-offset-4"
              >
                Sobre
              </a>
              <a
                href="/#servicos"
                onClick={(e) => handleSmoothScroll(e, "/#servicos")}
                className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline underline-offset-4"
              >
                Serviços
              </a>
              <a
                href="/#diferenciais"
                onClick={(e) => handleSmoothScroll(e, "/#diferenciais")}
                className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline underline-offset-4"
              >
                Diferenciais
              </a>
              <a
                href="/#depoimentos"
                onClick={(e) => handleSmoothScroll(e, "/#depoimentos")}
                className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline underline-offset-4"
              >
                Depoimentos
              </a>
            </nav>

            {/* Mobile menu button */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 transition-colors"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6 text-[var(--color-primary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Action buttons */}
            <div className="hidden lg:flex items-center gap-3 ml-auto flex-shrink-0">
              <a
                href="/blog"
                className="btn-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                Blog
              </a>
              <a
                href="/atendimento"
                className="btn-sm btn-primary"
              >
                Agendar
              </a>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          <div
            className={`lg:hidden mt-2 rounded-2xl bg-white shadow-2xl border border-[var(--color-accent)] overflow-hidden transition-all duration-300 relative z-50 ${mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <nav className="flex flex-col py-4">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    handleSmoothScroll(e, item.href);
                    setMobileMenuOpen(false);
                  }}
                  className="px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-background-secondary)]/50 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <div className="px-6 pt-4 pb-2 border-t border-[var(--color-accent)] mt-2">
                <a
                  href="/atendimento"
                  className="btn btn-primary w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Agendar Consulta
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
