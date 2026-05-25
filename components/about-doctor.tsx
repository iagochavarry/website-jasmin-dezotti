import Image from "next/image";

export default function AboutDoctor() {
  return (
    <section id="sobre">
      <div className="container">
        <div className="sobre-grid">
          <div className="sobre-image">
            <Image
              src="/images/v2/cirurgia.jpg"
              alt="Dra. Jasmin durante procedimento cirúrgico"
              width={1200}
              height={1500}
            />
            <span className="sobre-image-tag">Centro cirúrgico · Hospital Pedro Ernesto</span>
          </div>

          <div>
            <span className="section-label">Sobre a Dra. Jasmin</span>
            <h2 className="section-title">
              Medicina <em>atenta</em>, conduta serena.
            </h2>

            <p className="sobre-quote">
              Cada paciente carrega uma história, minha função é escutar com
              calma, e diagnosticar com precisão.
            </p>

            <div className="sobre-body">
              <p>
                Médica otorrinolaringologista formada pela Faculdade Souza
                Marques, com residência médica em Otorrinolaringologia pela
                UERJ, no Hospital Universitário Pedro Ernesto, referência em
                ensino, e formação clínica e cirúrgica no Rio de
                Janeiro.
              </p>
              <p>
                Sua trajetória combina sólida formação hospitalar com
                experiências em terapia intensiva, centro de tratamento de
                queimados, pesquisa em neuroimunologia pela UFRJ e{" "}
                <em>observership</em> internacional em Pneumologia na Cleveland
                Clinic, nos Estados Unidos.
              </p>
              <p>
                Com aprofundamento em anatomia cirúrgica aplicada e cursos de
                dissecção em mastoide, rinologia e base de crânio, a Dra. Jasmin
                direcionou sua subespecialização para <strong>Rinologia e Base de Crânio</strong>,
                com fellowship no HUPE/UERJ. Atua no manejo clínico e cirúrgico
                de rinossinusites, desvios septais, doenças nasossinusais, perdas auditivas, ronco e apneia, além
                de trabalhos científicos e apresentações em congressos no Brasil.
              </p>
              <p>
                Atualmente, atende no Rio de Janeiro e em Niterói, com atuação
                vinculada ao HUPE/UERJ, OTO Grupo e Pires de Melo.
              </p>
            </div>
          </div>
        </div>

        <div className="trajetoria">
          <div className="trajetoria-head">
            <div>
              <span className="section-label">Trajetória profissional</span>
              <h3>
                Formação <em>contínua</em>
                <br />
                em centros de referência.
              </h3>
            </div>
            <p>
              Da graduação à subespecialização em rinologia, uma trajetória
              construída em hospitais-escola, fellowships e estágios
              internacionais — com foco em medicina baseada em evidência e
              cirurgia de precisão.
            </p>
          </div>

          <div className="traj-grid">
            <div className="traj-col">
              <article className="traj-card">
                <span className="traj-tag">Graduação</span>
                <h4>Faculdade Souza Marques</h4>
                <span className="traj-sub">Doutorado em Medicina</span>
                <ul className="traj-list">
                  <li>Estágio · Centro de Tratamento de Queimados — Hospital Federal do Andaraí</li>
                  <li>Estágio em pesquisa · UFRJ — Neuroimunologia</li>
                  <li>Estágio em Terapia Intensiva · Rede D&apos;Or</li>
                  <li><strong>Observership</strong> · Cleveland Clinic, Pneumologia (EUA)</li>
                </ul>
              </article>

              <article className="traj-card">
                <span className="traj-tag">Aprofundamentos</span>
                <h4>Cursos de dissecção</h4>
                <span className="traj-sub">Anatomia cirúrgica aplicada</span>
                <ul className="traj-list">
                  <li>Dissecção de Mastoide · UFRJ</li>
                  <li>Dissecção de Rinologia e Base de Crânio · CETEB</li>
                </ul>
              </article>
            </div>

            <div className="traj-col">
              <article className="traj-card is-feature">
                <span className="traj-tag">Residência médica</span>
                <h4>Otorrinolaringologia</h4>
                <span className="traj-sub">UERJ — Hospital Universitário Pedro Ernesto</span>
                <ul className="traj-list">
                  <li>Programa completo em clínica e cirurgia otorrinolaringológica</li>
                  <li>Atuação em hospital-escola de referência no Rio de Janeiro</li>
                </ul>
              </article>

              <article className="traj-card is-feature">
                <span className="traj-tag">Fellowship</span>
                <h4>Rinologia</h4>
                <span className="traj-sub">HUPE — UERJ</span>
                <ul className="traj-list">
                  <li>Subespecialização em cirurgia endoscópica nasossinusal</li>
                  <li>Manejo avançado de rinossinusites e desvios septais</li>
                </ul>
              </article>
            </div>

            <div className="traj-col">
              <article className="traj-card">
                <span className="traj-tag">Apresentações em congressos</span>
                <h4>Trabalhos científicos</h4>
                <span className="traj-sub">Brasil</span>
                <ul className="traj-list">
                  <li>Congresso FORL · São Paulo</li>
                  <li>Sociedade de Otorrinolaringologia · Rio de Janeiro</li>
                </ul>
              </article>

              <article className="traj-card">
                <span className="traj-tag">Experiência clínica</span>
                <h4>Atuação atual</h4>
                <span className="traj-sub">Rio de Janeiro &amp; Niterói</span>
                <ul className="traj-list">
                  <li>UERJ · Hospital Universitário Pedro Ernesto</li>
                  <li>OTO Grupo · Ipanema, Barra, Tijuca e Madureira</li>
                  <li>Pires de Melo · Niterói</li>
                </ul>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
