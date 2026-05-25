import Image from "next/image";

export default function Specialties() {
  return (
    <section id="especialidades">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="section-label">Especialidades</span>
            <h2 className="section-title">
              Cuidado completo
              <br />
              em <em>ouvido, nariz e garganta</em>.
            </h2>
          </div>
        </div>

        <div className="spec-grid">
          <article className="spec-card">
            <span className="num">Ouvido</span>
            <Image className="spec-icon" src="/images/v2/icon-ouvido.png" alt="" width={76} height={76} />
            <h3>Otologia &amp; Audição</h3>
            <p>
              Investigação de zumbido, perda auditiva, otites de repetição e
              tonturas com avaliação audiológica precisa.
            </p>
            <ul className="spec-list">
              <li>Otoscopia digital</li>
              <li>Audiometria e impedanciometria</li>
              <li>Vertigem e labirintite</li>
            </ul>
          </article>

          <article className="spec-card">
            <span className="num">Nariz</span>
            <Image className="spec-icon" src="/images/v2/icon-nariz.png" alt="" width={76} height={76} />
            <h3>Rinologia</h3>
            <p>
              Manejo de rinites, sinusites e desvios de septo com
              videoendoscopia em consultório e plano terapêutico individualizado.
            </p>
            <ul className="spec-list">
              <li>Endoscopia nasal</li>
              <li>Rinite alérgica</li>
              <li>Sinusite crônica</li>
            </ul>
          </article>

          <article className="spec-card">
            <span className="num">Garganta</span>
            <Image className="spec-icon" src="/images/v2/icon-garganta.png" alt="" width={76} height={76} />
            <h3>Laringe &amp; Voz</h3>
            <p>
              Avaliação de rouquidão, refluxo laringofaríngeo, amigdalites
              recorrentes e cuidados com a voz profissional.
            </p>
            <ul className="spec-list">
              <li>Videolaringoscopia</li>
              <li>Disfonias e cuidados com a voz</li>
              <li>Amigdalite e faringite</li>
            </ul>
          </article>

          <article className="spec-card">
            <span className="num">Sono</span>
            <Image className="spec-icon" src="/images/v2/SleepingSnorring.png" alt="" width={76} height={76} />
            <h3>Sono &amp; Respiração</h3>
            <p>
              Investigação e tratamento de ronco e apneia obstrutiva do sono,
              com plano individualizado — clínico, cirúrgico ou combinado.
            </p>
            <ul className="spec-list">
              <li>Polissonografia</li>
              <li>Acompanhamento de CPAP</li>
              <li>Cirurgias faríngeas e nasais para apneia</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
