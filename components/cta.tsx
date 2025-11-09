export default function Cta() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w6xl mx-auto px-4 sm:px-6">
        <div className="bg-[var(--color-background-secondary)]/50 py-12 md:py-20 rounded-3xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl"
              data-aos="fade-up"
            >
              Pronto para cuidar da sua saúde?
            </h2>
            <p
              className="mb-8 text-lg text-[var(--color-text-secondary)]"
              data-aos="fade-up"
              data-aos-delay={200}
            >
              Agende sua consulta e dê o primeiro passo para respirar melhor e viver com mais qualidade.
            </p>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <div data-aos="fade-up" data-aos-delay={400}>
                <a
                  className="btn btn-primary w-full sm:w-auto"
                  href="/atendimento"
                >
                  Agendar Consulta
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
