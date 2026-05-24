import Hero from "@/components/hero-home";
import Marquee from "@/components/marquee";
import AboutDoctor from "@/components/about-doctor";
import Specialties from "@/components/specialties";
import Differentials from "@/components/differentials";
import Testimonials from "@/components/testimonials";
import Cta from "@/components/cta";
import StructuredData from "@/components/seo/structured-data";

export const metadata = {
  title: "Dra. Jasmin Dezotti Lovisi · Otorrinolaringologista no Rio de Janeiro",
  description:
    "Otorrinolaringologista especializada em rinologia, otologia e laringologia. Atendimento clínico e cirúrgico para ouvido, nariz e garganta no Rio de Janeiro. Agende pelo WhatsApp.",
  robots: "index, follow",
  alternates: { canonical: "https://jasmindezotti.com/" },
  openGraph: {
    title: "Dra. Jasmin Dezotti Lovisi · Otorrinolaringologista no Rio de Janeiro",
    description:
      "Otorrinolaringologista especializada em rinologia, otologia e laringologia. Atendimento clínico e cirúrgico no Rio de Janeiro.",
    url: "https://jasmindezotti.com/",
    siteName: "Dra. Jasmin Dezotti Lovisi",
    locale: "pt_BR",
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <StructuredData />
      <Hero />
      <Marquee />
      <AboutDoctor />
      <Specialties />
      <Differentials />
      <Testimonials />
      <Cta />
    </>
  );
}
