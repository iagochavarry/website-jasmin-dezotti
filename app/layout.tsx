import "./css/style.css";

import { Inter, Cormorant_Garamond } from "next/font/google";

import ConditionalHeader from "@/components/ui/conditional-header";
import GoogleAnalytics from "@/components/analytics/google-analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata = {
  title: "Dra. Jasmin Dezotti Lovisi - Otorrinolaringologista",
  description: "Otorrinolaringologista especializada em rinologia, otologia e laringologia. Atendimento de excelência e tratamentos personalizados no Rio de Janeiro.",
  robots: "index, follow",
  alternates: {
    canonical: "https://jasmindezotti.com/"
  },
  openGraph: {
    title: "Dra. Jasmin Dezotti Lovisi - Otorrinolaringologista",
    description: "Otorrinolaringologista especializada em rinologia, otologia e laringologia. Atendimento de excelência e tratamentos personalizados no Rio de Janeiro.",
    url: "https://jasmindezotti.com/",
    siteName: "Dra. Jasmin Dezotti Lovisi",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${cormorant.variable} bg-[var(--color-cream)] font-inter text-base text-[var(--color-ink)] antialiased relative`}
      >
        <GoogleAnalytics />
        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip relative">
          <ConditionalHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
