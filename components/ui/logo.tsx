"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/LogoStyledHD-NoBG.png";

export default function Logo() {
  return (
    <Link
      href="/"
      className="group relative inline-flex shrink-0 items-center justify-center rounded-lg p-2 transition-all duration-300 hover:bg-[var(--color-background-secondary)]/50"
      aria-label="Cruip"
    >
      <Image
        src={logo}
        alt="Cruip Logo"
        width={56}
        height={56}
        className="transition-transform duration-300 group-hover:scale-105"
      />
    </Link>
  );
}
