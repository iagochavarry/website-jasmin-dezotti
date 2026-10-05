import type { Metadata } from "next";
import AtlasViewer from "@/components/atlas/atlas-viewer";
import { INFO_CARDS } from "@/lib/atlas/head";

const TITLE = "Anatomia 3D · Dra. Jasmin Dezotti Lovisi";
const DESCRIPTION =
  "Explore em 3D o nariz e os seios da face: escolha um corte, mostre ou esconda estruturas e toque em cada parte para entender o que ela faz.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Keep it out of search results until the doctor has reviewed the content.
  robots: "noindex, follow",
  alternates: { canonical: "https://jasmindezotti.com/anatomia" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://jasmindezotti.com/anatomia",
    siteName: "Dra. Jasmin Dezotti Lovisi",
    locale: "pt_BR",
    type: "website",
  },
};

const WHATSAPP =
  "https://wa.me/5521997577798?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o%20com%20a%20Dra.%20Jasmin.";

export default function AnatomiaPage() {
  return (
    <>
      <section className="atlas-hero">
        <div className="container">
          <span className="eyebrow">Anatomia 3D</span>
          <h1>
            Nariz e <em>seios da face</em>
          </h1>
          <p className="lede">Gire, escolha um corte e toque numa estrutura para saber mais.</p>
        </div>
      </section>

      <div className="atlas-viewer-wrap">
        <AtlasViewer />
      </div>

      <section className="atlas-info-section">
        <div className="container">
          <div className="atlas-cards">
            {INFO_CARDS.map((c) => (
              <article key={c.title} className="atlas-card">
                <h2>{c.title}</h2>
                <p>{c.text}</p>
              </article>
            ))}
          </div>

          <aside className="atlas-cta">
            <div>
              <h3>
                Dúvidas sobre o seu <em>nariz</em> ou seus seios da face?
              </h3>
              <p>Na consulta, o exame do nariz (com endoscopia, quando indicada) mostra o que está acontecendo e qual o melhor tratamento para você.</p>
            </div>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Agendar avaliação
              <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </a>
          </aside>

          <p className="atlas-note">
            Modelo educativo e simplificado: ossos, seios da face, cornetos e septo vêm da tomografia de um adulto (conjunto público
            NasalSeg, Zhang et al., Scientific Data 2024,{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
              CC BY 4.0
            </a>
            ); as cartilagens do nariz e os dentes são de um modelo anatômico genérico (
            <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/" target="_blank" rel="noopener noreferrer">
              BodyParts3D
            </a>
            , © The Database Center for Life Science,{" "}
            <a href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en" target="_blank" rel="noopener noreferrer">
              CC BY-SA 2.1 Japão
            </a>
            ); a pele foi suavizada para não identificar a pessoa. Cada pessoa tem uma anatomia própria, e o diagnóstico é feito em
            consulta.
          </p>
        </div>
      </section>
    </>
  );
}
