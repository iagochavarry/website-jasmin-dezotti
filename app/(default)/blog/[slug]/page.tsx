import Image from "next/image";
import Link from "next/link";

// Mock data - substituir por busca em CMS/banco de dados
const blogPostsData: Record<string, any> = {
    "cuidados-com-rinite-alergica": {
        title: "Cuidados Essenciais com Rinite Alérgica",
        subtitle: "Entenda os sintomas, causas e como controlar a rinite alérgica no dia a dia.",
        category: "Rinologia",
        date: "15 de Novembro, 2024",
        author: "Dra. Jasmin Dezotti",
        image: "/images/workflow-01.png",
        content: `
      <p>A rinite alérgica é uma condição muito comum que afeta milhões de pessoas no Brasil. Caracterizada por espirros frequentes, coriza, coceira no nariz e congestão nasal, pode impactar significativamente a qualidade de vida.</p>

      <h2>O que causa a rinite alérgica?</h2>
      <p>A rinite alérgica ocorre quando o sistema imunológico reage exageradamente a substâncias presentes no ar, como:</p>
      <ul>
        <li>Ácaros da poeira</li>
        <li>Pólen de plantas</li>
        <li>Pelos de animais</li>
        <li>Fungos e mofo</li>
      </ul>

      <h2>Principais sintomas</h2>
      <p>Os sintomas mais comuns incluem:</p>
      <ul>
        <li>Espirros repetidos</li>
        <li>Coriza clara e abundante</li>
        <li>Coceira no nariz, olhos e garganta</li>
        <li>Congestão nasal</li>
        <li>Olhos lacrimejantes</li>
      </ul>

      <h2>Cuidados e prevenção</h2>
      <p>Para controlar os sintomas da rinite alérgica, recomendo:</p>
      <ul>
        <li>Manter a casa limpa e arejada</li>
        <li>Usar capas antiácaros em travesseiros e colchões</li>
        <li>Evitar tapetes e cortinas pesadas</li>
        <li>Trocar a roupa de cama semanalmente</li>
        <li>Usar ar condicionado com filtros limpos</li>
      </ul>

      <h2>Quando procurar um especialista</h2>
      <p>É importante consultar um otorrinolaringologista se você apresenta sintomas persistentes, crises frequentes ou se a rinite está afetando seu sono e atividades diárias. O tratamento adequado pode incluir medicamentos, imunoterapia e orientações personalizadas.</p>
    `,
    },
    "quando-procurar-otorrino": {
        title: "Quando Procurar um Otorrinolaringologista?",
        subtitle: "Conheça os principais sinais de que você deve consultar um especialista em otorrino.",
        category: "Saúde",
        date: "10 de Novembro, 2024",
        author: "Dra. Jasmin Dezotti",
        image: "/images/workflow-02.png",
        content: `
      <p>Muitas pessoas têm dúvidas sobre quando é necessário consultar um otorrinolaringologista. Este especialista cuida de problemas relacionados ao ouvido, nariz e garganta.</p>

      <h2>Sinais de alerta</h2>
      <p>Procure um otorrinolaringologista se você apresenta:</p>
      <ul>
        <li>Dor de garganta recorrente</li>
        <li>Ronco persistente ou apneia do sono</li>
        <li>Perda auditiva ou zumbido</li>
        <li>Sinusite frequente</li>
        <li>Sangramento nasal</li>
        <li>Alterações na voz</li>
      </ul>

      <h2>Prevenção é fundamental</h2>
      <p>O acompanhamento regular com um otorrinolaringologista pode prevenir complicações e garantir diagnóstico precoce de condições mais sérias.</p>
    `,
    },
    "sinusite-cronica-tratamento": {
        title: "Sinusite Crônica: Causas e Tratamento",
        subtitle: "Saiba identificar a sinusite crônica e as opções de tratamento disponíveis.",
        category: "Rinologia",
        date: "5 de Novembro, 2024",
        author: "Dra. Jasmin Dezotti",
        image: "/images/workflow-03.png",
        content: `
      <p>A sinusite crônica é uma inflamação prolongada dos seios da face que persiste por mais de 12 semanas, mesmo com tratamento.</p>

      <h2>Sintomas principais</h2>
      <ul>
        <li>Dor facial ou pressão</li>
        <li>Congestão nasal persistente</li>
        <li>Secreção nasal espessa</li>
        <li>Redução do olfato</li>
        <li>Dor de cabeça</li>
      </ul>

      <h2>Tratamento</h2>
      <p>O tratamento pode incluir medicamentos, lavagem nasal e, em casos específicos, cirurgia endoscópica dos seios da face.</p>
    `,
    },
};

interface PageProps {
    params: {
        slug: string;
    };
}

export default function BlogPost({ params }: PageProps) {
    const post = blogPostsData[params.slug];

    if (!post) {
        return (
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 text-center">
                <h1 className="text-3xl font-nacelle font-semibold text-[var(--color-text-primary)] mb-4">
                    Post não encontrado
                </h1>
                <Link href="/blog" className="btn btn-primary">
                    Voltar para o Blog
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* Hero Section */}
            <section>
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="py-12 md:py-20">
                        {/* Back Button */}
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors mb-8"
                        >
                            <svg
                                className="h-4 w-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Voltar para o Blog
                        </Link>

                        {/* Post Header */}
                        <div className="mb-8">
                            <div className="mb-4 flex items-center gap-3 text-sm">
                                <span className="rounded-full bg-[var(--color-secondary)]/20 px-3 py-1 border border-[var(--color-secondary)]/60">
                                    <span className="text-[var(--color-secondary)] font-semibold">
                                        {post.category}
                                    </span>
                                </span>
                                <span className="text-[var(--color-text-muted)]">
                                    {post.date}
                                </span>
                            </div>

                            <h1 className="mb-4 font-nacelle text-3xl font-semibold text-[var(--color-text-primary)] md:text-5xl">
                                {post.title}
                            </h1>

                            <p className="text-xl text-[var(--color-text-secondary)]">
                                {post.subtitle}
                            </p>

                            <div className="mt-6 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                                <span className="font-medium text-[var(--color-text-primary)]">
                                    Por {post.author}
                                </span>
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="mb-12 overflow-hidden rounded-2xl">
                            <Image
                                src={post.image}
                                alt={post.title}
                                width={800}
                                height={450}
                                className="h-auto w-full"
                                priority
                            />
                        </div>

                        {/* Post Content */}
                        <article
                            className="prose prose-lg mx-auto"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                            style={{
                                maxWidth: "65ch",
                                color: "var(--color-text-primary)",
                            }}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section>
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="border-t border-[var(--color-accent)] py-12 md:py-20">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-2xl font-semibold text-transparent md:text-3xl">
                                Precisa de uma avaliação especializada?
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

