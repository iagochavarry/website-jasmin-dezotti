import type { Metadata } from "next";
import ProcedureViewer from "@/components/anatomy/procedure-viewer";

const TITLE = "Septoplastia em 3D · Dra. Jasmin Dezotti Lovisi";
const DESCRIPTION =
  "Entenda o desvio de septo e a septoplastia, passo a passo, em um modelo 3D interativo da anatomia do nariz.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // Experimental page: keep it out of search results until it is linked from the site.
  robots: "noindex, follow",
  alternates: { canonical: "https://jasmindezotti.com/cirurgias/septoplastia" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://jasmindezotti.com/cirurgias/septoplastia",
    siteName: "Dra. Jasmin Dezotti Lovisi",
    locale: "pt_BR",
    type: "article",
  },
};

const WHATSAPP =
  "https://wa.me/5521997577798?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o%20sobre%20desvio%20de%20septo%20com%20a%20Dra.%20Jasmin.";

export default function SeptoplastiaPage() {
  return (
    <>
      <section className="proc-hero">
        <div className="container">
          <span className="eyebrow">Cirurgia em 3D</span>
          <h1>
            Septoplastia, <em>passo a passo</em>.
          </h1>
          <p className="lede">
            Veja por dentro o que é o desvio de septo e como a cirurgia devolve a passagem do ar. Gire, aproxime e
            remova camadas do modelo.
          </p>
        </div>
      </section>

      <section className="proc-viewer">
        <div className="container">
          <ProcedureViewer slug="septoplastia" />
        </div>
      </section>

      <section className="proc-info">
        <div className="container proc-info-grid">
          <article className="proc-block">
            <span className="section-label">Indicação</span>
            <h2>Quando a septoplastia é indicada?</h2>
            <p>
              Desvios pequenos são muito comuns e nem sempre causam sintomas. A cirurgia é considerada quando o desvio
              atrapalha a respiração e os sintomas não melhoram com o tratamento clínico.
            </p>
            <ul>
              <li>Nariz entupido persistente, de um ou dos dois lados</li>
              <li>Respiração pela boca, ronco e sono de pior qualidade</li>
              <li>Sinusites de repetição relacionadas à obstrução</li>
              <li>Sangramentos nasais ou dor de cabeça por contato do septo</li>
            </ul>
            <p>
              Muitas vezes a septoplastia é associada à redução das conchas nasais inferiores (turbinoplastia), quando
              elas também estão aumentadas.
            </p>
          </article>

          <article className="proc-block">
            <span className="section-label">Recuperação</span>
            <h2>Como costuma ser o pós-operatório?</h2>
            <ul>
              <li>A cirurgia é feita por dentro do nariz, sem cortes externos, e não muda o formato do nariz.</li>
              <li>Em geral é realizada com anestesia geral e a alta costuma ocorrer no mesmo dia ou no dia seguinte.</li>
              <li>
                Nas primeiras semanas é normal sentir o nariz congestionado, com crostas e secreção. A lavagem com soro
                ajuda na recuperação.
              </li>
              <li>Quando usadas, as placas de silicone são retiradas no consultório após alguns dias.</li>
              <li>Esforço físico e assoar o nariz com força devem ser evitados pelo período orientado.</li>
            </ul>
            <p>
              Como toda cirurgia, a septoplastia tem riscos — como sangramento, infecção e perfuração do septo — que são
              discutidos individualmente na consulta.
            </p>
          </article>

          <aside className="proc-cta">
            <h3>
              Respira mal por <em>um lado</em> do nariz?
            </h3>
            <p>Uma avaliação com exame endoscópico mostra se há desvio de septo e qual o melhor tratamento.</p>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Agendar avaliação
              <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </a>
          </aside>
        </div>

        <div className="container">
          <p className="proc-note">
            Modelo educativo e simplificado: cada nariz é único, e a indicação e a técnica cirúrgica são definidas em
            consulta. Anatomia adaptada de{" "}
            <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/" target="_blank" rel="noopener noreferrer">
              BodyParts3D
            </a>
            , © The Database Center for Life Science, licença{" "}
            <a href="https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en" target="_blank" rel="noopener noreferrer">
              CC BY-SA 2.1 JP
            </a>
            . Septo, mucosa e etapas cirúrgicas foram reconstruídos para fins educativos.
          </p>
        </div>
      </section>
    </>
  );
}
