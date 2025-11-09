import Image from "next/image";
import VideoThumb from "@/public/images/hero-image-01.jpg";

export default function HeroHome() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="py-12 md:py-20">
          <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-10 lg:gap-16">
            {/* Text content - Left side */}
            <div className="text-center md:text-left">
              <div className="mb-6">
                <h1
                  className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-3 font-nacelle text-3xl font-semibold text-transparent sm:text-4xl md:text-5xl lg:whitespace-nowrap mb-2"
                  data-aos="fade-up"
                >
                  Dra. Jasmin Dezotti
                </h1>
                <p
                  className="text-lg text-[var(--color-text-secondary)] mb-2 md:text-xl lg:whitespace-nowrap"
                  data-aos="fade-up"
                  data-aos-delay={100}
                >
                  Otorrinolaringologista
                </p>
                <p
                  className="text-sm text-[var(--color-text-secondary)] md:text-base lg:whitespace-nowrap"
                  data-aos="fade-up"
                  data-aos-delay={150}
                >
                  CRM 52125608-5 | Especialista em Rinologia
                </p>
              </div>
              <div className="mx-auto max-w-3xl md:mx-0">
                <p
                  className="mb-8 text-xl text-[var(--color-text-secondary)]"
                  data-aos="fade-up"
                  data-aos-delay={200}
                >
                  Cuidado humanizado e especializado para sua saúde respiratória.
                  Atendimento dedicado com foco em diagnóstico preciso e tratamentos personalizados.
                </p>
                <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center md:justify-start">
                  <div data-aos="fade-up" data-aos-delay={400}>
                    <a
                      className="btn btn-primary mb-4 w-full sm:mb-0 sm:w-auto"
                      href="/atendimento"
                    >
                      Agendar Consulta
                    </a>
                  </div>
                  <div data-aos="fade-up" data-aos-delay={600}>
                    <a
                      className="btn btn-outline relative w-full sm:ml-4 sm:w-auto"
                      href="#sobre"
                    >
                      Conhecer a Doutora
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Image - Right side */}
            <div className="flex justify-center md:justify-end" data-aos="fade-left" data-aos-delay={300}>
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src={VideoThumb}
                  alt="Dra. Jasmin Dezotti - Otorrinolaringologista"
                  width={400}
                  height={600}
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
