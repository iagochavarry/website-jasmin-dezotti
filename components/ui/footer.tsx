import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/LogoStyledHD-NoBG.png";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-background-secondary)]">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 justify-between gap-12 py-8 sm:grid-rows-[auto_auto] md:grid-cols-4 md:grid-rows-[auto_auto] md:py-12 lg:grid-cols-[repeat(4,minmax(0,140px))_1fr] lg:grid-rows-1 xl:gap-20">
          {/* 1st block */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Especialidades</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/#servicos"
                >
                  Rinologia
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/#servicos"
                >
                  Otologia
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/#servicos"
                >
                  Laringologia
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/#servicos"
                >
                  Cirurgias
                </a>
              </li>
            </ul>
          </div>
          {/* 2nd block */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Sobre</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="#sobre"
                >
                  A Doutora
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/#sobre"
                >
                  Formação
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/#depoimentos"
                >
                  Depoimentos
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/blog"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
          {/* 3rd block */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Atendimento</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/atendimento"
                >
                  Agendar Consulta
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="https://wa.me/+5521997734282"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telefone
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/atendimento"
                >
                  Localização
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/atendimento"
                >
                  Convênios
                </a>
              </li>
            </ul>
          </div>
          {/* 4th block */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
              Informações
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/blog"
                >
                  Perguntas Frequentes
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="/blog"
                >
                  Dicas de Saúde
                </a>
              </li>
            </ul>
          </div>
          {/* 5th block */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 lg:text-right">
            <div className="mb-3">
              <Link
                href="/"
                className="group relative inline-flex shrink-0 items-center justify-center rounded-lg p-2 transition-all duration-300 hover:bg-[var(--color-background-secondary)]/50"
                aria-label="Dra. Jasmin Dezotti"
              >
                <Image
                  src={logo}
                  alt="Logo Dra. Jasmin Dezotti"
                  width={112}
                  height={112}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            </div>
            <div className="text-sm">
              <p className="mb-3 text-[var(--color-text-secondary)]">
                Dra. Jasmin Dezotti
              </p>
              <p className="mb-3 text-[var(--color-text-secondary)]">
                CRM 52125602-5
              </p>
              <p className="mb-3 text-[var(--color-text-secondary)] text-xs">
                Otorrinolaringologia
              </p>
              <ul className="inline-flex gap-1">
                <li>
                  <a
                    className="flex items-center justify-center text-[var(--color-secondary)] transition hover:text-[var(--color-primary)] hover:scale-110 transition-transform"
                    href="https://wa.me/+5521997734282"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                  >
                    <svg
                      className="h-8 w-8 fill-current"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright e Selo de Segurança */}
        <div className="border-t border-[var(--color-accent)] py-6">
          <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:justify-between">
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
              <svg className="w-4 h-4 text-[var(--color-secondary)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Dados protegidos por SSL</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              © {new Date().getFullYear()} Dra. Jasmin Dezotti. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

