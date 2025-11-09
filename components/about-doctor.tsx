import Image from "next/image";
import ProfileImage from "@/public/images/profile.png";

export default function AboutDoctor() {
    return (
        <section id="sobre">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="py-12 md:py-20">
                    {/* Section content */}
                    <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-5 md:gap-16">
                        {/* Text Content */}
                        <div className="md:col-span-3">
                            <div className="mb-8">
                                <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-[var(--color-secondary)] after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-[var(--color-secondary)]">
                                    <span className="inline-flex bg-linear-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                                        Conheça
                                    </span>
                                </div>
                                <h2 className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                                    Sobre a Dra. Jasmin Dezotti
                                </h2>
                            </div>

                            <div className="space-y-4 text-[var(--color-text-secondary)]">
                                <p className="text-lg">
                                    Médica otorrinolaringologista com formação sólida e dedicação ao cuidado
                                    humanizado de cada paciente. Acredito que a medicina vai além do diagnóstico
                                    técnico – é sobre ouvir, compreender e oferecer soluções personalizadas.
                                </p>

                                <div className="space-y-6 pt-4">
                                    <div>
                                        <h3 className="mb-2 font-nacelle text-lg font-semibold text-[var(--color-text-primary)]">
                                            Formação Acadêmica
                                        </h3>
                                        <ul className="space-y-2 text-base">
                                            <li className="flex items-start gap-2">
                                                <svg
                                                    className="mt-1 h-5 w-5 shrink-0 fill-[var(--color-primary)]"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M10 0L0 5l10 5 10-5-10-5zm0 13L3 9.5v4.25c0 1.5 3.134 2.75 7 2.75s7-1.25 7-2.75V9.5L10 13z" />
                                                </svg>
                                                <span>
                                                    <strong className="text-[var(--color-text-primary)]">Graduação:</strong> Faculdade Souza Marques
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <svg
                                                    className="mt-1 h-5 w-5 shrink-0 fill-[var(--color-primary)]"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M10 0L0 5l10 5 10-5-10-5zm0 13L3 9.5v4.25c0 1.5 3.134 2.75 7 2.75s7-1.25 7-2.75V9.5L10 13z" />
                                                </svg>
                                                <span>
                                                    <strong className="text-[var(--color-text-primary)]">Residência:</strong> UERJ – Hospital Pedro Ernesto
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <svg
                                                    className="mt-1 h-5 w-5 shrink-0 fill-[var(--color-primary)]"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M10 0L0 5l10 5 10-5-10-5zm0 13L3 9.5v4.25c0 1.5 3.134 2.75 7 2.75s7-1.25 7-2.75V9.5L10 13z" />
                                                </svg>
                                                <span>
                                                    <strong className="text-[var(--color-text-primary)]">Fellowship:</strong> Rinologia - HUPE/UERJ
                                                </span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 font-nacelle text-lg font-semibold text-[var(--color-text-primary)]">
                                            Áreas de Especialização
                                        </h3>
                                        <p>
                                            Com especialização avançada em rinologia, atuo no diagnóstico e tratamento
                                            de doenças nasais e sinusais, incluindo rinites, sinusites crônicas e
                                            alterações estruturais como desvio de septo. Também ofereço atendimento
                                            completo em otologia e laringologia, cuidando da saúde auditiva e vocal
                                            dos meus pacientes.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="mb-2 font-nacelle text-lg font-semibold text-[var(--color-text-primary)]">
                                            Filosofia de Atendimento
                                        </h3>
                                        <p>
                                            Cada paciente é único e merece um tratamento personalizado. Dedico tempo
                                            para ouvir suas queixas, entender seu histórico e esclarecer todas as
                                            dúvidas. Meu objetivo é proporcionar não apenas alívio dos sintomas, mas
                                            também educação sobre saúde e prevenção de doenças.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <a
                                        href="/atendimento"
                                        className="btn btn-primary inline-flex"
                                    >
                                        Agendar Consulta
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Image/Stats Side */}
                        <div className="md:col-span-2">
                            <div className="space-y-6">
                                {/* Profile Card */}
                                <div className="rounded-2xl bg-white p-6 shadow-lg border border-[var(--color-accent)]">
                                    <div className="space-y-4 text-center">
                                        <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-[var(--color-primary)] p-1 bg-white">
                                            <Image
                                                src={ProfileImage}
                                                alt="Dra. Jasmin Dezotti"
                                                width={128}
                                                height={128}
                                                className="h-full w-full object-cover rounded-full"
                                                priority
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-nacelle text-xl font-semibold text-[var(--color-text-primary)]">
                                                Dra. Jasmin Dezotti
                                            </h3>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                CRM 52125608-5
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="space-y-3">
                                    <div className="rounded-xl bg-white p-4 shadow-sm border border-[var(--color-accent)]">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]/20">
                                                <svg
                                                    className="h-5 w-5 fill-[var(--color-primary)]"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[var(--color-text-primary)]">Atendimento Humanizado</p>
                                                <p className="text-xs text-[var(--color-text-secondary)]">Tempo dedicado a cada paciente</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-white p-4 shadow-sm border border-[var(--color-accent)]">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]/20">
                                                <svg
                                                    className="h-5 w-5 fill-[var(--color-primary)]"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[var(--color-text-primary)]">Especialização Avançada</p>
                                                <p className="text-xs text-[var(--color-text-secondary)]">Fellowship em Rinologia</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-white p-4 shadow-sm border border-[var(--color-accent)]">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary)]/20">
                                                <svg
                                                    className="h-5 w-5 fill-[var(--color-primary)]"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-[var(--color-text-primary)]">Formação de Excelência</p>
                                                <p className="text-xs text-[var(--color-text-secondary)]">UERJ - Hospital Pedro Ernesto</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

