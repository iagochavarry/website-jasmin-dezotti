"use client";

import Logo from "./logo";

export default function Header() {
  return (
    <header className="z-30 mt-2 w-full md:mt-5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-16 items-center justify-between gap-6 rounded-2xl bg-white/95 px-6 shadow-md border border-[var(--color-accent)] backdrop-blur-sm">
          {/* Site branding */}
          <div className="flex items-center flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop navigation - Centered */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
            <a
              href="/#sobre"
              className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline underline-offset-4"
            >
              Sobre
            </a>
            <a
              href="/#servicos"
              className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline underline-offset-4"
            >
              Serviços
            </a>
            <a
              href="/#diferenciais"
              className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline underline-offset-4"
            >
              Diferenciais
            </a>
            <a
              href="/#depoimentos"
              className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline underline-offset-4"
            >
              Depoimentos
            </a>
            <a
              href="/blog"
              className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] hover:underline underline-offset-4"
            >
              Blog
            </a>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-3 ml-auto flex-shrink-0">
            <a
              href="/atendimento"
              className="btn-sm btn-primary"
            >
              Agendar
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
