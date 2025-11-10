import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/breadcrumbs";

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
      <p>A <strong>rinite alérgica</strong> é uma condição muito comum que afeta milhões de pessoas no Brasil. Caracterizada por espirros frequentes, coriza, coceira no nariz e congestão nasal, pode impactar significativamente a qualidade de vida. Como <strong>otorrinolaringologista especializada em rinologia</strong>, vou compartilhar informações essenciais sobre esta condição.</p>

      <h2>O que causa a rinite alérgica?</h2>
      <p>A rinite alérgica ocorre quando o sistema imunológico reage exageradamente a substâncias presentes no ar (alérgenos), como:</p>
      <ul>
        <li><strong>Ácaros da poeira</strong> - principais causadores em ambientes internos</li>
        <li><strong>Pólen de plantas</strong> - mais comum na primavera e outono</li>
        <li><strong>Pelos de animais</strong> - cães, gatos e outros pets</li>
        <li><strong>Fungos e mofo</strong> - em ambientes úmidos</li>
        <li><strong>Poluição atmosférica</strong> - especialmente em grandes cidades como Rio de Janeiro</li>
      </ul>

      <h2>Principais sintomas da rinite alérgica</h2>
      <p>Os sintomas mais comuns que observo em meus pacientes incluem:</p>
      <ul>
        <li>Espirros repetidos (especialmente pela manhã)</li>
        <li>Coriza clara e abundante</li>
        <li>Coceira no nariz, olhos e garganta</li>
        <li>Congestão nasal (nariz entupido)</li>
        <li>Olhos lacrimejantes e vermelhos</li>
        <li>Fadiga e irritabilidade</li>
        <li>Dificuldade para dormir</li>
      </ul>

      <h2>Cuidados e prevenção - Dicas da Dra. Jasmin</h2>
      <p>Para controlar os sintomas da rinite alérgica, recomendo as seguintes medidas preventivas:</p>
      
      <h3>Ambiente doméstico:</h3>
      <ul>
        <li>Manter a casa limpa e bem arejada</li>
        <li>Usar capas antiácaros em travesseiros e colchões</li>
        <li>Evitar tapetes, cortinas pesadas e bichos de pelúcia</li>
        <li>Trocar a roupa de cama semanalmente com água quente</li>
        <li>Usar ar condicionado com filtros limpos</li>
        <li>Manter umidade do ar entre 40-60%</li>
      </ul>

      <h3>Cuidados pessoais:</h3>
      <ul>
        <li>Lavar o nariz com soro fisiológico diariamente</li>
        <li>Evitar exposição a perfumes e produtos químicos fortes</li>
        <li>Usar óculos de sol para proteger os olhos do pólen</li>
        <li>Tomar banho antes de dormir para remover alérgenos</li>
      </ul>

      <h2>Tratamento especializado em otorrinolaringologia</h2>
      <p>O tratamento da rinite alérgica pode incluir:</p>
      <ul>
        <li><strong>Medicamentos antialérgicos</strong> - anti-histamínicos e corticoides nasais</li>
        <li><strong>Imunoterapia</strong> - vacinas para dessensibilização</li>
        <li><strong>Lavagem nasal</strong> - técnicas específicas de higiene nasal</li>
        <li><strong>Orientações personalizadas</strong> - adaptadas ao seu estilo de vida</li>
      </ul>

      <h2>Quando procurar um otorrinolaringologista no Rio de Janeiro</h2>
      <p>É importante consultar um especialista se você apresenta:</p>
      <ul>
        <li>Sintomas persistentes por mais de 2 semanas</li>
        <li>Crises frequentes que afetam o trabalho ou estudos</li>
        <li>Dificuldade para dormir devido à congestão nasal</li>
        <li>Sintomas que não melhoram com medicamentos de farmácia</li>
        <li>Complicações como sinusite recorrente</li>
      </ul>

      <p>Como <strong>otorrinolaringologista em Madureira e Zona Sul</strong>, atendo pacientes com rinite alérgica oferecendo diagnóstico preciso e tratamento personalizado. <a href="/atendimento">Agende sua consulta</a> para uma avaliação completa.</p>
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
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const post = blogPostsData[slug];

    if (!post) {
        return {
            title: "Post não encontrado - Dra. Jasmin Dezotti",
            description: "O post solicitado não foi encontrado.",
        };
    }

    return {
        title: `${post.title} - Dra. Jasmin Dezotti | Otorrinolaringologista`,
        description: post.subtitle,
        robots: "index, follow",
        alternates: {
            canonical: `https://jasmindezotti.com/blog/${slug}/`
        },
        openGraph: {
            title: `${post.title} - Dra. Jasmin Dezotti`,
            description: post.subtitle,
            url: `https://jasmindezotti.com/blog/${slug}/`,
            siteName: "Dra. Jasmin Dezotti Lovisi",
            locale: "pt_BR",
            type: "article",
            publishedTime: post.date,
            authors: [post.author],
            section: post.category,
        },
        keywords: [
            "otorrinolaringologista",
            "Rio de Janeiro",
            "Madureira",
            "Zona Sul",
            post.category.toLowerCase(),
            "rinologia",
            "otologia",
            "laringologia"
        ].join(", "),
    };
}

export default async function BlogPost({ params }: PageProps) {
    const { slug } = await params;
    const post = blogPostsData[slug];

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
                        <Breadcrumbs
                            items={[
                                { label: "Blog", href: "/blog" },
                                { label: post.title }
                            ]}
                        />
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

                        {/* Related Links */}
                        <div className="mt-12 p-6 bg-[var(--color-background-secondary)]/50 rounded-2xl border border-[var(--color-accent)]">
                            <h3 className="font-nacelle text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                                Links Relacionados
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    href="/atendimento"
                                    className="block text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors font-medium"
                                >
                                    → Agendar Consulta com a Dra. Jasmin Dezotti
                                </Link>
                                <Link
                                    href="/blog"
                                    className="block text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors font-medium"
                                >
                                    → Ver Mais Artigos sobre Otorrinolaringologia
                                </Link>
                                <Link
                                    href="/#servicos"
                                    className="block text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors font-medium"
                                >
                                    → Conheça Nossos Serviços Especializados
                                </Link>
                            </div>
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

