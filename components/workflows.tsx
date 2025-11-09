import Image from "next/image";
import WorflowImg01 from "@/public/images/workflow-01.png";
import WorflowImg02 from "@/public/images/workflow-02.png";
import WorflowImg03 from "@/public/images/workflow-03.png";
import Spotlight from "@/components/spotlight";
import ScrollIndicator from "@/components/scroll-indicator";

export default function Workflows() {
  return (
    <section id="servicos">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-[var(--color-secondary)] after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-[var(--color-secondary)]">
              <span className="inline-flex bg-linear-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                Áreas de Atuação
              </span>
            </div>
            <h2 className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
              Tratamentos Especializados
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)]">
              Atendimento completo em otorrinolaringologia com foco em diagnóstico
              preciso e tratamentos personalizados para cada paciente.
            </p>
          </div>
          {/* Spotlight items */}
          <Spotlight className="group mx-auto grid max-w-sm items-start gap-6 lg:max-w-none lg:grid-cols-3">
            {/* Card 1 */}
            <a
              className="group/card relative h-full overflow-hidden rounded-2xl bg-gray-800 p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-indigo-500/80 before:opacity-0 before:blur-3xl before:transition-opacity before:duration-500 after:pointer-events-none after:absolute after:-left-48 after:-top-48 after:z-30 after:h-64 after:w-64 after:translate-x-[var(--mouse-x)] after:translate-y-[var(--mouse-y)] after:rounded-full after:bg-indigo-500 after:opacity-0 after:blur-3xl after:transition-opacity after:duration-500 hover:after:opacity-20 group-hover:before:opacity-100"
              href="#0"
            >
              <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-gray-950 after:absolute after:inset-0 after:bg-linear-to-br after:from-gray-900/50 after:via-gray-800/25 after:to-gray-900/50">
                {/* Arrow */}
                <div
                  className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-gray-700/50 bg-gray-800/65 text-gray-200 opacity-0 transition-opacity group-hover/card:opacity-100"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={9}
                    height={8}
                    fill="none"
                  >
                    <path
                      fill="#F4F4F5"
                      d="m4.92 8-.787-.763 2.733-2.68H0V3.443h6.866L4.133.767 4.92 0 9 4 4.92 8Z"
                    />
                  </svg>
                </div>
                {/* Image */}
                <div className="h-[288px] w-full overflow-hidden">
                  <Image
                    className="h-full w-full object-cover object-center group-hover/card:scale-110 transition-transform duration-500"
                    src={WorflowImg01}
                    width={350}
                    height={288}
                    alt="Rinologia - Tratamento nasal especializado"
                  />
                </div>
                {/* Content */}
                <div className="p-6">
                  <div className="mb-3">
                    <span className="btn-sm relative rounded-full bg-[var(--color-secondary)]/40 px-3 py-1 text-xs font-normal border-2 border-[var(--color-secondary)]/70">
                      <span className="text-[var(--color-secondary)] font-bold">
                        Rinologia
                      </span>
                    </span>
                  </div>
                  <p className="text-gray-300 font-inter text-sm leading-relaxed mb-3">
                    Tratamento especializado de doenças nasais e sinusais, incluindo
                    rinite, sinusite e desvio de septo. Fellowship em HUPE/UERJ.
                  </p>
                  <div className="flex items-center gap-1 text-[var(--color-secondary)] text-sm font-medium group-hover/card:gap-2 transition-all">
                    <span>Saiba mais</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
            {/* Card 2 */}
            <a
              className="group/card relative h-full overflow-hidden rounded-2xl bg-gray-800 p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-indigo-500/80 before:opacity-0 before:blur-3xl before:transition-opacity before:duration-500 after:pointer-events-none after:absolute after:-left-48 after:-top-48 after:z-30 after:h-64 after:w-64 after:translate-x-[var(--mouse-x)] after:translate-y-[var(--mouse-y)] after:rounded-full after:bg-indigo-500 after:opacity-0 after:blur-3xl after:transition-opacity after:duration-500 hover:after:opacity-20 group-hover:before:opacity-100"
              href="#0"
            >
              <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-gray-950 after:absolute after:inset-0 after:bg-linear-to-br after:from-gray-900/50 after:via-gray-800/25 after:to-gray-900/50">
                {/* Arrow */}
                <div
                  className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-gray-700/50 bg-gray-800/65 text-gray-200 opacity-0 transition-opacity group-hover/card:opacity-100"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={9}
                    height={8}
                    fill="none"
                  >
                    <path
                      fill="#F4F4F5"
                      d="m4.92 8-.787-.763 2.733-2.68H0V3.443h6.866L4.133.767 4.92 0 9 4 4.92 8Z"
                    />
                  </svg>
                </div>
                {/* Image */}
                <div className="h-[288px] w-full overflow-hidden">
                  <Image
                    className="h-full w-full object-cover object-center group-hover/card:scale-110 transition-transform duration-500"
                    src={WorflowImg02}
                    width={350}
                    height={288}
                    alt="Otologia - Saúde auditiva"
                  />
                </div>
                {/* Content */}
                <div className="p-6">
                  <div className="mb-3">
                    <span className="btn-sm relative rounded-full bg-[var(--color-secondary)]/40 px-3 py-1 text-xs font-normal border-2 border-[var(--color-secondary)]/70">
                      <span className="text-[var(--color-secondary)] font-bold">
                        Otologia
                      </span>
                    </span>
                  </div>
                  <p className="text-gray-300 font-inter text-sm leading-relaxed mb-3">
                    Diagnóstico e tratamento de problemas auriculares, como otite,
                    perda auditiva, zumbido e tontura. Cuidado integral da saúde auditiva.
                  </p>
                  <div className="flex items-center gap-1 text-[var(--color-secondary)] text-sm font-medium group-hover/card:gap-2 transition-all">
                    <span>Saiba mais</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
            {/* Card 3 */}
            <a
              className="group/card relative h-full overflow-hidden rounded-2xl bg-gray-800 p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-indigo-500/80 before:opacity-0 before:blur-3xl before:transition-opacity before:duration-500 after:pointer-events-none after:absolute after:-left-48 after:-top-48 after:z-30 after:h-64 after:w-64 after:translate-x-[var(--mouse-x)] after:translate-y-[var(--mouse-y)] after:rounded-full after:bg-indigo-500 after:opacity-0 after:blur-3xl after:transition-opacity after:duration-500 hover:after:opacity-20 group-hover:before:opacity-100"
              href="#0"
            >
              <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-gray-950 after:absolute after:inset-0 after:bg-linear-to-br after:from-gray-900/50 after:via-gray-800/25 after:to-gray-900/50">
                {/* Arrow */}
                <div
                  className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-gray-700/50 bg-gray-800/65 text-gray-200 opacity-0 transition-opacity group-hover/card:opacity-100"
                  aria-hidden="true"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={9}
                    height={8}
                    fill="none"
                  >
                    <path
                      fill="#F4F4F5"
                      d="m4.92 8-.787-.763 2.733-2.68H0V3.443h6.866L4.133.767 4.92 0 9 4 4.92 8Z"
                    />
                  </svg>
                </div>
                {/* Image */}
                <div className="h-[288px] w-full overflow-hidden">
                  <Image
                    className="h-full w-full object-cover object-center group-hover/card:scale-110 transition-transform duration-500"
                    src={WorflowImg03}
                    width={350}
                    height={288}
                    alt="Laringologia - Saúde vocal"
                  />
                </div>
                {/* Content */}
                <div className="p-6">
                  <div className="mb-3">
                    <span className="btn-sm relative rounded-full bg-[var(--color-secondary)]/40 px-3 py-1 text-xs font-normal border-2 border-[var(--color-secondary)]/70">
                      <span className="text-[var(--color-secondary)] font-bold">
                        Laringologia
                      </span>
                    </span>
                  </div>
                  <p className="text-gray-300 font-inter text-sm leading-relaxed mb-3">
                    Tratamento de alterações na voz, doenças da garganta e laringe.
                    Acompanhamento de problemas vocais e respiratórios da via aérea superior.
                  </p>
                  <div className="flex items-center gap-1 text-[var(--color-secondary)] text-sm font-medium group-hover/card:gap-2 transition-all">
                    <span>Saiba mais</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          </Spotlight>
        </div>
      </div>
      <ScrollIndicator text="Diferenciais do Atendimento" />
    </section>
  );
}
