export default function Cta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className="pb-4 font-nacelle text-3xl font-semibold text-white md:text-4xl"
              data-aos="fade-up"
            >
              Pronto para cuidar da sua saúde?
            </h2>
            <p
              className="mb-8 text-lg text-white/90"
              data-aos="fade-up"
              data-aos-delay={200}
            >
              Agende sua consulta e dê o primeiro passo para respirar melhor e viver com mais qualidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div data-aos="fade-up" data-aos-delay={400}>
                <a
                  className="btn bg-white text-[var(--color-primary)] hover:bg-white/90 w-full sm:w-auto shadow-lg hover:shadow-xl hover:scale-105 font-semibold transition-all duration-300"
                  href="https://wa.me/+5521987449385?text=Olá%2C%20gostaria%20de%20agendar%20uma%20consulta%20com%20a%20Dra.%20Jasmin%20Dezotti."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Agendar Consulta
                </a>
              </div>
              <div data-aos="fade-up" data-aos-delay={500}>
                <a
                  className="btn btn-outline border-2 border-white text-white hover:bg-white hover:text-[var(--color-primary)] w-full sm:w-auto inline-flex items-center gap-2 transition-all duration-300 hover:scale-105"
                  href="tel:+5521987449385"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Ligar Agora
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
