import Image from "next/image";
import Link from "next/link";

export default function HeroHome() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <span className="eyebrow">Atendimento e Cirurgias · Rio de Janeiro</span>

          <h1 className="display">
            Dra. Jasmin
            <br />
            <em>Dezotti</em> Lovisi
          </h1>

          <div className="credentials">
            <span>Otorrinolaringologista</span>
            <span className="dot"></span>
            <span>CRM 52125602-5</span>
            <span className="dot"></span>
            <span>RQE 60167</span>
          </div>

          <p className="lede">
            Cuidado especializado em ouvido, nariz e garganta — um olhar atento,
            técnico e acolhedor para cada queixa, da criança ao adulto.
          </p>

          <div className="hero-ctas">
            <Link href="#agendar" className="btn btn-primary">
              Agendar Consulta
              <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </Link>
            <Link href="#especialidades" className="btn btn-ghost">
              Conhecer especialidades
            </Link>
          </div>
        </div>

        <div>
          <div className="portrait-wrap">
            <svg className="portrait-arc" viewBox="0 0 600 750" aria-hidden="true">
              <defs>
                <linearGradient id="arcG" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#C07A52" stopOpacity="0" />
                  <stop offset=".5" stopColor="#C07A52" stopOpacity=".7" />
                  <stop offset="1" stopColor="#C07A52" stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle cx="300" cy="375" r="290" fill="none" stroke="url(#arcG)" strokeWidth="1.4" strokeDasharray="2 6" />
              <path d="M 60 480 C 180 420, 240 520, 360 460" fill="none" stroke="#6E7563" strokeWidth="1.2" strokeLinecap="round" opacity=".7" />
              <path d="M 40 540 C 180 480, 260 580, 420 520" fill="none" stroke="#6E7563" strokeWidth="1.2" strokeLinecap="round" opacity=".5" />
              <path d="M 80 600 C 200 560, 280 640, 460 580" fill="none" stroke="#6E7563" strokeWidth="1.2" strokeLinecap="round" opacity=".3" />
              <path d="M 540 220 C 580 220, 580 280, 545 285 C 525 290, 525 270, 540 265 C 555 258, 555 242, 540 242" fill="none" stroke="#C07A52" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M 500 200 Q 510 240 500 280" fill="none" stroke="#C07A52" strokeWidth="1.2" strokeLinecap="round" opacity=".5" />
              <path d="M 480 188 Q 494 240 480 292" fill="none" stroke="#C07A52" strokeWidth="1.2" strokeLinecap="round" opacity=".3" />
            </svg>

            <div className="portrait-frame">
              <Image
                className="portrait-img"
                src="/images/v2/dra-jasmin.png"
                alt="Dra. Jasmin Dezotti Lovisi"
                width={960}
                height={1200}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
