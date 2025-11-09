import Image from "next/image";
import Link from "next/link";

export const metadata = {
    title: "Blog - Dra. Jasmin Dezotti | Otorrinolaringologista",
    description: "Artigos, dicas e informações sobre saúde respiratória, otorrinolaringologia e bem-estar. Conteúdo educativo da Dra. Jasmin Dezotti.",
};

// Mock data - substituir futuramente por CMS ou banco de dados
const blogPosts = [
    {
        slug: "cuidados-com-rinite-alergica",
        title: "Cuidados Essenciais com Rinite Alérgica",
        subtitle: "Entenda os sintomas, causas e como controlar a rinite alérgica no dia a dia.",
        category: "Rinologia",
        date: "15 de Novembro, 2024",
        image: "/images/workflow-01.png",
    },
    {
        slug: "quando-procurar-otorrino",
        title: "Quando Procurar um Otorrinolaringologista?",
        subtitle: "Conheça os principais sinais de que você deve consultar um especialista em otorrino.",
        category: "Saúde",
        date: "10 de Novembro, 2024",
        image: "/images/workflow-02.png",
    },
    {
        slug: "sinusite-cronica-tratamento",
        title: "Sinusite Crônica: Causas e Tratamento",
        subtitle: "Saiba identificar a sinusite crônica e as opções de tratamento disponíveis.",
        category: "Rinologia",
        date: "5 de Novembro, 2024",
        image: "/images/workflow-03.png",
    },
    {
        slug: "saude-auditiva-prevencao",
        title: "Saúde Auditiva: Prevenção é Fundamental",
        subtitle: "Dicas importantes para preservar sua audição e prevenir problemas auditivos.",
        category: "Otologia",
        date: "1 de Novembro, 2024",
        image: "/images/workflow-01.png",
    },
    {
        slug: "cuidados-com-a-voz",
        title: "Cuidados com a Voz: Guia Completo",
        subtitle: "Orientações para manter a saúde vocal e prevenir problemas na laringe.",
        category: "Laringologia",
        date: "28 de Outubro, 2024",
        image: "/images/workflow-02.png",
    },
    {
        slug: "cirurgia-de-septo-nasal",
        title: "Cirurgia de Desvio de Septo: O que Esperar",
        subtitle: "Entenda o procedimento, recuperação e benefícios da septoplastia.",
        category: "Cirurgia",
        date: "25 de Outubro, 2024",
        image: "/images/workflow-03.png",
    },
];

export default function Blog() {
    return (
        <>
            {/* Hero Section */}
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="py-12 md:py-20">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-linear-to-r before:from-transparent before:to-[var(--color-secondary)] after:h-px after:w-8 after:bg-linear-to-l after:from-transparent after:to-[var(--color-secondary)]">
                                <span className="inline-flex bg-linear-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-transparent">
                                    Conteúdo Educativo
                                </span>
                            </div>
                            <h1 className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-5xl">
                                Blog
                            </h1>
                            <p className="text-lg text-[var(--color-text-secondary)]">
                                Artigos, dicas e informações sobre saúde respiratória e otorrinolaringologia para você cuidar melhor da sua saúde.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Posts Grid */}
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="pb-12 md:pb-20">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {blogPosts.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-[var(--color-accent)] transition-all duration-300 hover:shadow-md hover:border-[var(--color-primary)]"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 w-full overflow-hidden">
                                        <Image
                                            src={post.image}
                                            alt={post.title}
                                            width={400}
                                            height={192}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-grow p-6">
                                        {/* Category & Date */}
                                        <div className="mb-3 flex items-center justify-between text-xs">
                                            <span className="rounded-full bg-[var(--color-secondary)]/20 px-2.5 py-1 border border-[var(--color-secondary)]/60">
                                                <span className="text-[var(--color-secondary)] font-semibold">
                                                    {post.category}
                                                </span>
                                            </span>
                                            <span className="text-[var(--color-text-muted)]">
                                                {post.date}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="mb-2 font-nacelle text-xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                                            {post.title}
                                        </h2>

                                        {/* Subtitle */}
                                        <p className="text-sm text-[var(--color-text-secondary)] flex-grow">
                                            {post.subtitle}
                                        </p>

                                        {/* Read More */}
                                        <div className="mt-4 text-sm font-medium text-[var(--color-primary)]">
                                            Ler artigo →
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="border-t border-[var(--color-accent)] py-12 md:py-20">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-2xl font-semibold text-transparent md:text-3xl">
                                Precisa de atendimento especializado?
                            </h2>
                            <p className="mb-6 text-[var(--color-text-secondary)]">
                                Agende sua consulta e receba orientação profissional personalizada.
                            </p>
                            <a href="/atendimento" className="btn btn-primary">
                                Agendar Consulta
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

