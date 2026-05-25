const TESTIMONIALS: { feature?: boolean; quote: string; initial: string; name: string; meta: string }[] = [
  {
    feature: true,
    quote:
      "Depois de anos sofrendo com sinusite crônica, finalmente encontrei alívio. A Dra. Jasmin foi extremamente atenciosa, explicou todo o tratamento e me acompanhou em cada etapa. Hoje respiro muito melhor e minha qualidade de vida mudou completamente.",
    initial: "M",
    name: "Maria Silva",
    meta: "Rio de Janeiro · 2025",
  },
  {
    quote:
      "Excelente profissional. Tratei um problema de audição que me incomodava há anos. A doutora foi muito paciente, tirou todas as minhas dúvidas e o resultado foi além das minhas expectativas.",
    initial: "C",
    name: "Carlos Mendes",
    meta: "Rio de Janeiro · 2025",
  },
  {
    quote:
      "O atendimento foi acolhedor desde o primeiro contato. Meu filho tinha problemas recorrentes de otite e graças ao tratamento correto da Dra. Jasmin, ele está curado. Recomendo de olhos fechados.",
    initial: "A",
    name: "Ana Paula Costa",
    meta: "Rio de Janeiro · 2024",
  },
];

export default function Testimonials() {
  return (
    <section id="depoimentos">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="section-label">Depoimentos</span>
            <h2 className="section-title">
              O que dizem
              <br />
              sobre <em>a consulta</em>.
            </h2>
          </div>
          <p className="section-intro">
            Avaliações reais de pacientes — coletadas em plataformas verificadas.
          </p>
        </div>

        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <article key={i} className={`testi${t.feature ? " feature" : ""}`}>
              <div className="stars">★★★★★</div>
              <p className="testi-quote">{t.quote}</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.initial}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-meta">{t.meta}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
