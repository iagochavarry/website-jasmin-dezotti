"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo.png";

export default function Logo() {
  return (
    <Link
      href="/"
      className="group relative inline-flex shrink-0 items-center justify-center rounded-full p-2 transition-all duration-300 hover:bg-[var(--color-background-secondary)]/50"
      aria-label="Cruip"
    >
      <Image
        src={logo}
        alt="Cruip Logo"
        width={32}
        height={32}
        className="transition-transform duration-300 group-hover:scale-105"
      />
    </Link>
  );
}
