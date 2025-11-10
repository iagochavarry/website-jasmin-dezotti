import "./css/style.css";

import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Image from "next/image";

import ConditionalHeader from "@/components/ui/conditional-header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const nacelle = localFont({
  src: [
    {
      path: "../public/fonts/nacelle-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/nacelle-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/nacelle-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/nacelle-semibolditalic.woff2",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-nacelle",
  display: "swap",
});

export const metadata = {
  title: "Dra. Jasmin Dezotti - Otorrinolaringologista",
  description: "Otorrinolaringologista especializada em rinologia, otologia e laringologia. Atendimento humanizado e tratamentos personalizados no Rio de Janeiro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${nacelle.variable} bg-[var(--color-background-primary)] font-inter text-base text-[var(--color-text-primary)] antialiased relative`}
      >
        {/* Background Mesh */}
        <div className="fixed inset-0 -z-10 opacity-40">
          <Image
            src="/images/mesh2.jpg"
            alt=""
            fill
            className="object-cover blur-[2px] saturate-50"
            quality={50}
            priority
          />
        </div>

        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip relative">
          <ConditionalHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
