export const metadata = {
  title: "Dra. Jasmin Dezotti Lovisi - Otorrinolaringologista Rio de Janeiro",
  description: "Otorrinolaringologista especializada em rinologia, otologia e laringologia. Consultas e tratamentos para ouvido, nariz e garganta no Rio de Janeiro. Agende pelo WhatsApp.",
  robots: "index, follow",
  alternates: {
    canonical: "https://jasmindezotti.com/"
  },
  openGraph: {
    title: "Dra. Jasmin Dezotti Lovisi - Otorrinolaringologista Rio de Janeiro",
    description: "Otorrinolaringologista especializada em rinologia, otologia e laringologia. Consultas e tratamentos para ouvido, nariz e garganta no Rio de Janeiro.",
    url: "https://jasmindezotti.com/",
    siteName: "Dra. Jasmin Dezotti Lovisi",
    locale: "pt_BR",
    type: "website",
  },
};

// import SoonAvailable from "@/components/soon-available";

// Página original salva para quando o site estiver pronto
// header
// footer

import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Hero from "@/components/hero-home";
import AboutDoctor from "@/components/about-doctor";
import Workflows from "@/components/workflows";
import Features from "@/components/features";
import Testimonials from "@/components/testimonials";
import Cta from "@/components/cta";
import StructuredData from "@/components/seo/structured-data";
import SoonAvailable from "@/components/soon-available";

export default function Home() {
  // return (
  //   <>
  //     <StructuredData />
  //     <SoonAvailable />
  //   </>
  // );

  // Página completa para restaurar depois:
  return (
    <>
      <StructuredData />
      <Header />
      <Hero />
      <AboutDoctor />
      <Workflows />
      <Features />
      <Testimonials />
      <Cta />
      <Footer />
    </>
  );
}
