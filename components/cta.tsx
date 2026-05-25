export default function Cta() {
  return (
    <section className="cta-band" id="agendar">
      <div className="container">
        <div className="cta-card">
          <div>
            <span className="section-label">Marque sua avaliação</span>
            <h3>
              Pronta para te <em>escutar</em>.
              <br />
              Hoje, com calma.
            </h3>
            <p>
              Agende sua consulta presencial — atendimento particular e por
              reembolso, com retorno orientado quando indicado.
            </p>
            <div className="cta-actions">
              <a
                href="https://wa.me/5521997577798?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20uma%20consulta%20com%20a%20Dra.%20Jasmin."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Agendar pelo WhatsApp
                <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m13 5 7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          <dl className="cta-info">
            <dt>Telefone</dt>
            <dd>(21) 99757-7798</dd>
            {/* TODO(content): confirm Instagram handle */}
            <dt>Instagram</dt>
            <dd>@jasminlovisi.otorrino</dd>
            {/* TODO(content): confirm clinic address */}
            <dt>Endereço</dt>
            <dd>Barra da Tijuca, Rio de Janeiro</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}
