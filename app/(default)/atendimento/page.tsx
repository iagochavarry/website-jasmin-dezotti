import Image from "next/image";
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
    title: "Agendar Consulta - Dra. Jasmin Dezotti | Otorrinolaringologista",
    description: "Agende sua consulta com a Dra. Jasmin Dezotti. Atendimento especializado em otorrinolaringologia com foco em rinologia, otologia e laringologia.",
};

export default function Atendimento() {
    return (
        <>
            {/* Hero Section */}
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="py-12 md:py-20">
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
                                    Escolha o local mais conveniente para sua consulta. Atendimento humanizado em todos os endereços.
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
                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Local 1 - Oto Grupo Ipanema */}
                            <div className="flex flex-col rounded-2xl bg-white p-6 shadow-md border-2 border-[var(--color-accent)] hover:border-[var(--color-primary)] transition-colors duration-300">
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
                                        Oto Grupo - Ipanema
                                    </h3>
                                    <p className="mb-2 text-sm text-[var(--color-text-secondary)]">
                                        Fórum de Ipanema
                                    </p>
                                    <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                                        R. Visc. de Pirajá, 351 - 1124
                                        <br />
                                        Ipanema, Rio de Janeiro - RJ
                                        <br />
                                        CEP: 22410-003
                                    </p>
                                    <p className="mb-4 text-xs text-[var(--color-text-muted)]">
                                        <a
                                            href="https://otogrupo.com.br"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-[var(--color-primary)] transition-colors"
                                        >
                                            otogrupo.com.br
                                        </a>
                                    </p>
                                </div>
                                <a
                                    href="https://wa.me/+5521987449385?text=Olá%2C%20gostaria%20de%20agendar%20uma%20consulta%20com%20a%20Dra.%20Jasmin%20Dezotti."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary w-full"
                                >
                                    Agendar Consulta
                                </a>
                            </div>

                            {/* Local 2 - Oto Grupo Madureira */}
                            <div className="flex flex-col rounded-2xl bg-white p-6 shadow-md border-2 border-[var(--color-accent)] hover:border-[var(--color-primary)] transition-colors duration-300">
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
                                    <p className="mb-2 text-sm text-[var(--color-text-secondary)]">
                                        Ao lado do Shopping Madureira
                                    </p>
                                    <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                                        R. Soares Caldeira, 142 - 1113
                                        <br />
                                        Madureira, Rio de Janeiro - RJ
                                        <br />
                                        CEP: 21351-080
                                    </p>
                                    <p className="mb-4 text-xs text-[var(--color-text-muted)]">
                                        <a
                                            href="https://otogrupo.com.br"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-[var(--color-primary)] transition-colors"
                                        >
                                            otogrupo.com.br
                                        </a>
                                    </p>
                                </div>
                                <a
                                    href="https://wa.me/+5521997180604?text=Olá%2C%20gostaria%20de%20agendar%20uma%20consulta%20com%20a%20Dra.%20Jasmin%20Dezotti."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary w-full"
                                >
                                    Agendar Consulta
                                </a>
                            </div>

                            {/* Local 3 - Consultório Particular Botafogo */}
                            <div className="flex flex-col rounded-2xl bg-white p-6 shadow-md border-2 border-[var(--color-accent)] hover:border-[var(--color-primary)] transition-colors duration-300">
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
                                        Leblon Empresarial
                                    </h3>
                                    <p className="mb-2 text-sm text-[var(--color-text-secondary)]">
                                        Consultório Particular
                                    </p>
                                    <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
                                        Av. Ataulfo de Paiva, 204
                                        <br />
                                        Leblon, Rio de Janeiro - RJ
                                    </p>
                                </div>
                                <a
                                    href="https://wa.me/+5521997734282?text=Olá%2C%20gostaria%20de%20agendar%20uma%20consulta%20com%20a%20Dra.%20Jasmin%20Dezotti."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary w-full"
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

                        <div className="grid gap-6 md:grid-cols-3">
                            {/* Hospital 1 - HUPE/UERJ */}
                            <div className="rounded-xl bg-white overflow-hidden shadow-sm border border-[var(--color-accent)] hover:shadow-md transition-shadow duration-300">
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

                            {/* Hospital 2 - Rio's D'Or */}
                            <div className="rounded-xl bg-white overflow-hidden shadow-sm border border-[var(--color-accent)] hover:shadow-md transition-shadow duration-300">
                                <div className="h-32 w-full overflow-hidden">
                                    <Image
                                        src={RiosDorImage}
                                        alt="Hospital Rio's D'Or"
                                        width={400}
                                        height={128}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="font-nacelle text-lg font-semibold text-[var(--color-text-primary)]">
                                        Hospital Rio&apos;s D&apos;Or
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                                        Rede D&apos;Or
                                        <br />
                                        São Cristóvão
                                    </p>
                                </div>
                            </div>

                            {/* Hospital 3 - Copa Star */}
                            <div className="rounded-xl bg-white overflow-hidden shadow-sm border border-[var(--color-accent)] hover:shadow-md transition-shadow duration-300">
                                <div className="h-32 w-full overflow-hidden">
                                    <Image
                                        src={CopaStarImage}
                                        alt="Hospital Copa Star"
                                        width={400}
                                        height={128}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="font-nacelle text-lg font-semibold text-[var(--color-text-primary)]">
                                        Hospital Copa Star
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                                        Rede D&apos;Or
                                        <br />
                                        Copacabana
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
                            <div className="inline-flex rounded-xl bg-[var(--color-background-secondary)]/50 px-6 py-4">
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    <strong className="text-[var(--color-text-primary)]">Seu plano não está na lista?</strong> Entre em contato para verificar a aceitação.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
