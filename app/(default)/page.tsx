export const metadata = {
  title: "Dra. Jasmin Dezotti - Otorrinolaringologista | Rinologia, Otologia e Laringologia",
  description: "Dra. Jasmin Dezotti, otorrinolaringologista especializada em rinologia. Atendimento humanizado para tratamento de sinusite, rinite, problemas auditivos e doenças da garganta. Agende sua consulta.",
};

import Hero from "@/components/hero-home";
import AboutDoctor from "@/components/about-doctor";
import Workflows from "@/components/workflows";
import Features from "@/components/features";
import Testimonials from "@/components/testimonials";
import Cta from "@/components/cta";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutDoctor />
      <Workflows />
      <Features />
      <Testimonials />
      <Cta />
    </>
  );
}
