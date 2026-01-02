import Logo from "./logo";

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
                  href="#0"
                >
                  Rinologia
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="#0"
                >
                  Otologia
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="#0"
                >
                  Laringologia
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="#0"
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
                  href="#0"
                >
                  Formação
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="#0"
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
                  href="https://wa.me/5521999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Agendar Consulta
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="tel:+5521999999999"
                >
                  Telefone
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="#0"
                >
                  Localização
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="#0"
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
                  href="#0"
                >
                  Perguntas Frequentes
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="#0"
                >
                  Dicas de Saúde
                </a>
              </li>
              <li>
                <a
                  className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                  href="#0"
                >
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>
          {/* 5th block */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 lg:text-right">
            <div className="mb-3">
              <Logo />
            </div>
            <div className="text-sm">
              <p className="mb-3 text-[var(--color-text-secondary)]">
                Dra. Jasmin Dezotti
              </p>
              <p className="mb-3 text-[var(--color-text-secondary)]">
                CRM 52125608-5
              </p>
              <p className="mb-3 text-[var(--color-text-secondary)] text-xs">
                Otorrinolaringologia
              </p>
              <ul className="inline-flex gap-1">
                <li>
                  <a
                    className="flex items-center justify-center text-[var(--color-secondary)] transition hover:text-[var(--color-primary)] hover:scale-110 transition-transform"
                    href="https://wa.me/+5521987449385"
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
                <li>
                  <a
                    className="flex items-center justify-center text-[var(--color-secondary)] transition hover:text-[var(--color-primary)] hover:scale-110 transition-transform"
                    href="#0"
                    aria-label="Instagram"
                  >
                    <svg
                      className="h-8 w-8 fill-current"
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M23 8H9a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1Zm-1.708 3.791-.858.823a.251.251 0 0 0-.1.241V18.9a.251.251 0 0 0 .1.241l.838.823v.181h-4.215v-.181l.868-.843c.085-.085.085-.11.085-.241v-4.887l-2.41 6.131h-.329l-2.81-6.13V18.1a.567.567 0 0 0 .156.472l1.129 1.37v.181h-3.2v-.181l1.129-1.37a.547.547 0 0 0 .146-.472v-4.749a.416.416 0 0 0-.138-.351l-1-1.209v-.181H13.8l2.4 5.283 2.122-5.283h2.971l-.001.181Z" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    className="flex items-center justify-center text-[var(--color-secondary)] transition hover:text-[var(--color-primary)]"
                    href="#0"
                    aria-label="Github"
                  >
                    <svg
                      className="h-8 w-8 fill-current"
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z" />
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

