import Link from "next/link";

const ITEMS = [
  {
    title: "Formação de excelência",
    sub: "Graduação na Faculdade Souza Marques; residência em Otorrinolaringologia na UERJ (HUPE), com estágio internacional na Cleveland Clinic (EUA).",
  },
  {
    title: "Especialização em rinologia",
    sub: "Fellowship em rinologia no HUPE/UERJ, com aprofundamentos em dissecção de rinologia e base de crânio (CETEB) e mastoide (UFRJ).",
  },
  {
    title: "Escuta clínica cuidadosa",
    sub: "Tempo para entender sintomas, histórico, rotina e expectativas antes de definir a conduta.",
  },
  {
    title: "Conduta individualizada",
    sub: "Plano de tratamento pensado para cada paciente, evitando soluções genéricas ou excessivas.",
  },
  {
    title: "Acompanhamento responsável",
    sub: "Continuidade do cuidado com retorno orientado e ajuste da conduta conforme evolução.",
  },
];

export default function Differentials() {
  return (
    <section id="diferenciais">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="section-label">Diferenciais</span>
            <h2 className="section-title">
              Uma consulta que <em>realmente</em> escuta.
            </h2>
          </div>
          <p className="section-intro">
            Pequenos cuidados que mudam totalmente a experiência médica — do
            agendamento ao retorno.
          </p>
        </div>

        <div className="diff-grid">
          <ul className="diff-list">
            {ITEMS.map((item, i) => (
              <li key={i}>
                <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="ttl">{item.title}</div>
                  <div className="sub">{item.sub}</div>
                </div>
                <span className="arrow-link">→</span>
              </li>
            ))}
          </ul>

          <aside className="diff-aside">
            <div className="visual">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                <circle cx="60" cy="60" r="48" strokeDasharray="3 6" />
                <circle cx="60" cy="60" r="32" />
                <path d="M60 28v64M28 60h64" />
                <circle cx="60" cy="60" r="6" fill="#E6BFA6" stroke="none" />
              </svg>
            </div>
            <h4>
              Tecnologia clínica
              <br />a serviço do diagnóstico.
            </h4>
            <p>
              Quando indicado, exames como otoscopia, endoscopia nasal e
              nasofibrolaringoscopia auxiliam uma avaliação mais precisa de
              ouvido, nariz e garganta, permitindo decisões mais seguras e bem
              explicadas ao paciente.
            </p>
            <Link href="#agendar" className="btn btn-terra">
              Agendar avaliação
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
