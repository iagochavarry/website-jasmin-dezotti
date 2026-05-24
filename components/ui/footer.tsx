import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="container">
        <div className="foot-grid">
          <div>
            <Link href="/" className="foot-brand brand">
              <Image
                className="brand-mark"
                src="/images/v2/logo-submark-white.png"
                alt=""
                width={64}
                height={64}
              />
              <span className="brand-text">
                <span className="brand-name">Jasmin Lovisi</span>
                <span className="brand-sub">Otorrinolaringologista</span>
              </span>
            </Link>
            <p className="foot-blurb">
              Cuidado especializado em ouvido, nariz e garganta — para crianças
              e adultos no Rio de Janeiro.
            </p>
          </div>

          <div>
            <div className="foot-h">Navegar</div>
            <ul className="foot-list">
              <li><Link href="/#sobre">Sobre</Link></li>
              <li><Link href="/#especialidades">Especialidades</Link></li>
              <li><Link href="/#diferenciais">Diferenciais</Link></li>
              <li><Link href="/#depoimentos">Depoimentos</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>

          <div>
            <div className="foot-h">Contato</div>
            <ul className="foot-list">
              <li>(21) 99773-4282</li>
              {/* TODO(content): confirm email with Jasmin */}
              <li>contato@jasminlovisi.com.br</li>
              {/* TODO(content): confirm Instagram handle */}
              <li>@jasminlovisi.otorrino</li>
              {/* TODO(content): confirm clinic address */}
              <li>Barra da Tijuca, RJ</li>
            </ul>
          </div>

          <div>
            <div className="foot-h">Atendimento</div>
            <ul className="foot-list">
              <li>Seg — Sex · 09h às 19h</li>
              <li>Sábado · 09h às 13h</li>
              <li>Particular &amp; reembolso</li>
            </ul>
          </div>
        </div>

        <div className="foot-bot">
          <div>© {year} Dra. Jasmin Dezotti Lovisi · CRM 52125602-5 · RQE 60167</div>
          <div className="foot-social">
            <a
              href="https://instagram.com/jasminlovisi.otorrino"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.4a4 4 0 1 1-7.9 1.2 4 4 0 0 1 7.9-1.2z" />
                <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
              </svg>
            </a>
            <a
              href="https://wa.me/5521997734282"
              aria-label="WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.4 8.4 0 0 1-12.8 7.2L3 21l2.4-5A8.4 8.4 0 1 1 21 11.5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
