import Image from "next/image";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import ClientLogo01 from "@/public/images/client-logo-01.svg";
import ClientLogo02 from "@/public/images/client-logo-02.svg";
import ClientLogo03 from "@/public/images/client-logo-03.svg";
import ClientLogo04 from "@/public/images/client-logo-04.svg";
import ClientLogo05 from "@/public/images/client-logo-05.svg";
import ClientLogo06 from "@/public/images/client-logo-06.svg";
import ClientLogo07 from "@/public/images/client-logo-07.svg";
import ClientLogo08 from "@/public/images/client-logo-08.svg";
import ClientLogo09 from "@/public/images/client-logo-09.svg";
import HupeImage from "@/public/images/hupe.jpg";
import RiosDorImage from "@/public/images/riosdor.jpg";
import CopaStarImage from "@/public/images/star.png";

export const metadata = {
    title: "Agendar Consulta - Dra. Jasmin Dezotti Lovisi | Otorrinolaringologista",
    description: "Agende sua consulta com a Dra. Jasmin Dezotti. Atendimento especializado em otorrinolaringologia em Madureira e Zona Sul, Rio de Janeiro. Agende pelo WhatsApp.",
    robots: "index, follow",
    alternates: {
        canonical: "https://jasmindezotti.com/atendimento/"
    },
    openGraph: {
        title: "Agendar Consulta - Dra. Jasmin Dezotti Lovisi | Otorrinolaringologista",
        description: "Agende sua consulta com a Dra. Jasmin Dezotti. Atendimento especializado em otorrinolaringologia em Madureira e Zona Sul, Rio de Janeiro.",
        url: "https://jasmindezotti.com/atendimento/",
        siteName: "Dra. Jasmin Dezotti Lovisi",
        locale: "pt_BR",
        type: "website",
    },
};

export default function Atendimento() {
    return (
        <>
            {/* Hero Section */}
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="py-12 md:py-20">
                        <Breadcrumbs items={[{ label: "Atendimento" }]} />
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="mb-8">
                                <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-[var(--color-secondary)] after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-[var(--color-secondary)]">
                                    <span className="inline-flex bg-linear-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                                        Agende sua Consulta
                                    </span>
                                </div>
                                <h1 className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-5xl">
                                    Locais de Atendimento
                                </h1>
                                <p className="text-lg text-[var(--color-text-secondary)]">
                                    Escolha o local mais conveniente para sua consulta. Atendimento de excelência em todos os endereços.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Locais de Atendimento */}
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="pb-12 md:pb-20">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Local 1 - Oto Grupo Madureira */}
                            <div className="flex flex-col rounded-2xl bg-white p-6 shadow-lg border-2 border-[var(--color-accent)] hover:border-[var(--color-primary)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-4 flex-grow">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                                        <svg
                                            className="h-6 w-6 fill-[var(--color-primary)]"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 font-nacelle text-xl font-semibold text-[var(--color-text-primary)]">
                                        Oto Grupo - Madureira
                                    </h3>
                                    <p className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                                        Ao lado do Shopping Madureira
                                    </p>
                                    <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                                        R. Soares Caldeira, 142 - 1113
                                        <br />
                                        Madureira, Rio de Janeiro - RJ
                                        <br />
                                        CEP: 21351-080
                                    </p>

                                    {/* Ícones informativos */}
                                    <div className="space-y-2 mb-4 pb-4 border-b border-[var(--color-accent)]">
                                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                            <svg className="w-4 h-4 text-[var(--color-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Horário sob agendamento</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                            <svg className="w-4 h-4 text-[var(--color-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            <span>Fácil acesso de transporte público</span>
                                        </div>
                                    </div>

                                    <p className="mb-4 text-xs text-[var(--color-text-muted)]">
                                        <a
                                            href="https://otogrupo.com.br"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-[var(--color-primary)] transition-colors underline"
                                        >
                                            otogrupo.com.br
                                        </a>
                                    </p>
                                </div>
                                <a
                                    href="https://wa.me/+5521997180604?text=Olá%2C%20gostaria%20de%20agendar%20uma%20consulta%20com%20a%20Dra.%20Jasmin%20Dezotti."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary w-full hover:scale-105 transition-transform"
                                >
                                    Agendar Consulta
                                </a>
                            </div>

                            {/* Local 2 - Consultório Particular */}
                            <div className="flex flex-col rounded-2xl bg-white p-6 shadow-lg border-2 border-[var(--color-accent)] hover:border-[var(--color-primary)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="mb-4 flex-grow">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                                        <svg
                                            className="h-6 w-6 fill-[var(--color-primary)]"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 font-nacelle text-xl font-semibold text-[var(--color-text-primary)]">
                                        Consultório Particular
                                    </h3>
                                    <p className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                                        Zona Sul
                                    </p>
                                    <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                                        Local: Zona Sul, Rio de Janeiro - RJ
                                        <br />
                                        <span className="text-xs text-[var(--color-text-muted)]">Endereço informado no agendamento</span>
                                    </p>

                                    {/* Ícones informativos */}
                                    <div className="space-y-2 mb-4 pb-4 border-b border-[var(--color-accent)]">
                                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                            <svg className="w-4 h-4 text-[var(--color-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Horário sob agendamento</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                                            <svg className="w-4 h-4 text-[var(--color-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>Atendimento particular</span>
                                        </div>
                                    </div>
                                </div>
                                <a
                                    href="https://wa.me/+5521997734282?text=Olá%2C%20gostaria%20de%20agendar%20uma%20consulta%20com%20a%20Dra.%20Jasmin%20Dezotti."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary w-full hover:scale-105 transition-transform"
                                >
                                    Agendar Consulta
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cirurgias */}
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="border-t border-[var(--color-accent)] py-12 md:py-20">
                        <div className="mb-12 text-center">
                            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-[var(--color-secondary)] after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-[var(--color-secondary)]">
                                <span className="inline-flex bg-linear-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                                    Procedimentos Cirúrgicos
                                </span>
                            </div>
                            <h2 className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                                Hospitais Credenciados
                            </h2>
                            <p className="text-lg text-[var(--color-text-secondary)]">
                                Cirurgias realizadas em hospitais de excelência com infraestrutura completa e equipe qualificada.
                            </p>
                        </div>

                        <div className="flex justify-center">
                            {/* Hospital - HUPE/UERJ */}
                            <div className="rounded-xl bg-white overflow-hidden shadow-sm border border-[var(--color-accent)] hover:shadow-md transition-shadow duration-300 max-w-sm">
                                <div className="h-32 w-full overflow-hidden">
                                    <Image
                                        src={HupeImage}
                                        alt="HUPE/UERJ"
                                        width={400}
                                        height={128}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="font-nacelle text-lg font-semibold text-[var(--color-text-primary)]">
                                        HUPE/UERJ
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                                        Hospital Universitário
                                        <br />
                                        Pedro Ernesto
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Planos de Saúde */}
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="border-t border-[var(--color-accent)] py-12 md:py-20">
                        <div className="mb-12 text-center">
                            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-[var(--color-secondary)] after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-[var(--color-secondary)]">
                                <span className="inline-flex bg-linear-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                                    Convênios Aceitos
                                </span>
                            </div>
                            <h2 className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
                                Planos de Saúde
                            </h2>
                            <p className="text-lg text-[var(--color-text-secondary)]">
                                Aceitamos os principais planos de saúde. Consulte disponibilidade para seu convênio.
                            </p>
                        </div>

                        {/* Logo Gallery with Scroll */}
                        <div className="relative">
                            <div className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide snap-x snap-mandatory">
                                <div className="flex items-center justify-center min-w-[200px] h-24 rounded-xl bg-white p-6 shadow-sm border border-[var(--color-accent)] snap-center">
                                    <Image
                                        src={ClientLogo01}
                                        alt="Plano de Saúde 1"
                                        width={120}
                                        height={40}
                                        className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                                <div className="flex items-center justify-center min-w-[200px] h-24 rounded-xl bg-white p-6 shadow-sm border border-[var(--color-accent)] snap-center">
                                    <Image
                                        src={ClientLogo02}
                                        alt="Plano de Saúde 2"
                                        width={120}
                                        height={40}
                                        className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                                <div className="flex items-center justify-center min-w-[200px] h-24 rounded-xl bg-white p-6 shadow-sm border border-[var(--color-accent)] snap-center">
                                    <Image
                                        src={ClientLogo03}
                                        alt="Plano de Saúde 3"
                                        width={120}
                                        height={40}
                                        className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                                <div className="flex items-center justify-center min-w-[200px] h-24 rounded-xl bg-white p-6 shadow-sm border border-[var(--color-accent)] snap-center">
                                    <Image
                                        src={ClientLogo04}
                                        alt="Plano de Saúde 4"
                                        width={120}
                                        height={40}
                                        className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                                <div className="flex items-center justify-center min-w-[200px] h-24 rounded-xl bg-white p-6 shadow-sm border border-[var(--color-accent)] snap-center">
                                    <Image
                                        src={ClientLogo05}
                                        alt="Plano de Saúde 5"
                                        width={120}
                                        height={40}
                                        className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                                <div className="flex items-center justify-center min-w-[200px] h-24 rounded-xl bg-white p-6 shadow-sm border border-[var(--color-accent)] snap-center">
                                    <Image
                                        src={ClientLogo06}
                                        alt="Plano de Saúde 6"
                                        width={120}
                                        height={40}
                                        className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                                <div className="flex items-center justify-center min-w-[200px] h-24 rounded-xl bg-white p-6 shadow-sm border border-[var(--color-accent)] snap-center">
                                    <Image
                                        src={ClientLogo07}
                                        alt="Plano de Saúde 7"
                                        width={120}
                                        height={40}
                                        className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                                <div className="flex items-center justify-center min-w-[200px] h-24 rounded-xl bg-white p-6 shadow-sm border border-[var(--color-accent)] snap-center">
                                    <Image
                                        src={ClientLogo08}
                                        alt="Plano de Saúde 8"
                                        width={120}
                                        height={40}
                                        className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                                <div className="flex items-center justify-center min-w-[200px] h-24 rounded-xl bg-white p-6 shadow-sm border border-[var(--color-accent)] snap-center">
                                    <Image
                                        src={ClientLogo09}
                                        alt="Plano de Saúde 9"
                                        width={120}
                                        height={40}
                                        className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                            </div>

                            {/* Scroll Indicator */}
                            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
                                ← Deslize para ver mais planos →
                            </p>
                        </div>

                        {/* Contact Note */}
                        <div className="mt-10 text-center">
                            <div className="inline-flex flex-col items-center rounded-xl bg-[var(--color-background-secondary)]/70 px-8 py-5 border border-[var(--color-accent)] shadow-sm">
                                <p className="text-sm text-[var(--color-text-primary)] mb-3">
                                    <strong className="font-semibold">Seu plano não está na lista?</strong>
                                    <br />
                                    Entre em contato para consultar disponibilidade
                                </p>
                                <a
                                    href="https://wa.me/+5521987449385?text=Olá%2C%20gostaria%20de%20saber%20se%20aceitam%20meu%20convênio."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors underline"
                                >
                                    Consultar Disponibilidade
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
