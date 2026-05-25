"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isStuck, setIsStuck] = useState(false);
  const pathname = usePathname();
  const isBlog = pathname.startsWith("/blog");

  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${isStuck ? " is-stuck" : ""}`}>
      <div className="container nav">
        <Link href="/" className="brand" aria-label="Dra. Jasmin Dezotti Lovisi">
          <Image
            className="brand-mark"
            src="/images/v2/logo-submark-white.png"
            alt=""
            width={76}
            height={76}
            priority
          />
          <span className="brand-text">
            <span className="brand-name">Jasmin Dezotti</span>
            <span className="brand-sub">Otorrinolaringologista</span>
          </span>
        </Link>

        <ul className="nav-links">
          <li><Link href="/#sobre">Sobre</Link></li>
          <li><Link href="/#especialidades">Especialidades</Link></li>
          <li><Link href="/#diferenciais">Diferenciais</Link></li>
          <li><Link href="/#depoimentos">Depoimentos</Link></li>
        </ul>

        <div className="nav-actions">
          <Link href="/blog" className={`nav-blog${isBlog ? " is-active" : ""}`}>Blog</Link>
          <Link href="/#agendar" className="btn btn-primary">
            Agendar
            <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
