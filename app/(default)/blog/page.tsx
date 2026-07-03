import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog · Dra. Jasmin Dezotti Lovisi",
  description:
    "Artigos sobre saúde respiratória, otorrinolaringologia e bem-estar. Conteúdo escrito e revisado pela Dra. Jasmin Dezotti.",
  robots: "index, follow",
  alternates: { canonical: "https://jasmindezotti.com/blog/" },
  openGraph: {
    title: "Blog · Dra. Jasmin Dezotti Lovisi",
    description:
      "Artigos sobre saúde respiratória, otorrinolaringologia e bem-estar.",
    url: "https://jasmindezotti.com/blog/",
    siteName: "Dra. Jasmin Dezotti Lovisi",
    locale: "pt_BR",
    type: "website",
  },
};

const POSTS = [
  {
    slug: "o-que-e-otorrino",
    title: "O que é Otorrinolaringologia?",
    subtitle:
      "Entenda o que faz um otorrinolaringologista e quando procurar este especialista.",
    category: "Saúde",
    readingTime: "8 min",
    cover: "/images/otorrino-icons.png",
  },
  {
    slug: "cuidados-com-rinite-alergica",
    title: "Cuidados Essenciais com Rinite Alérgica",
    subtitle:
      "Sintomas, causas e como controlar a rinite alérgica no dia a dia.",
    category: "Rinologia",
    readingTime: "6 min",
    cover: "/images/workflow-01.png",
  },
];

export default function Blog() {
  return (
    <>
      <section className="blog-hero">
        <div className="container blog-hero-grid">
          <div>
            <span className="eyebrow">Diário clínico</span>
            <h1>
              Conhecimento
              <br />
              que <em>cuida</em>.
            </h1>
            <p className="lede">
              Artigos para entender — sem jargão — o que acontece com o ouvido,
              o nariz e a garganta. Conteúdo escrito e revisado pela Dra. Jasmin.
            </p>
          </div>
        </div>
      </section>

      <section className="post-grid-wrap">
        <div className="container">
          <div className="post-grid">
            {POSTS.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="post-card article">
                <div className="post-cover">
                  <span className="tag">Artigo</span>
                  <Image
                    src={p.cover}
                    alt=""
                    width={800}
                    height={500}
                    style={{ objectFit: "contain", width: "100%", height: "100%" }}
                  />
                </div>
                <div className="post-body">
                  <div className="meta">
                    <span>{p.category}</span>
                    <span className="dot"></span>
                    <span>{p.readingTime}</span>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.subtitle}</p>
                  <span className="read">Ler →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
