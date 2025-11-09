"use client";

import { useState } from "react";
import useMasonry from "@/utils/useMasonry";
import Image, { StaticImageData } from "next/image";
import TestimonialImg01 from "@/public/images/testimonial-01.jpg";
import TestimonialImg02 from "@/public/images/testimonial-02.jpg";
import TestimonialImg03 from "@/public/images/testimonial-03.jpg";
import TestimonialImg04 from "@/public/images/testimonial-04.jpg";
import TestimonialImg05 from "@/public/images/testimonial-05.jpg";
import TestimonialImg06 from "@/public/images/testimonial-06.jpg";
import TestimonialImg07 from "@/public/images/testimonial-07.jpg";
import TestimonialImg08 from "@/public/images/testimonial-08.jpg";
import TestimonialImg09 from "@/public/images/testimonial-09.jpg";
import ClientImg01 from "@/public/images/client-logo-01.svg";
import ClientImg02 from "@/public/images/client-logo-02.svg";
import ClientImg03 from "@/public/images/client-logo-03.svg";
import ClientImg04 from "@/public/images/client-logo-04.svg";
import ClientImg05 from "@/public/images/client-logo-05.svg";
import ClientImg06 from "@/public/images/client-logo-06.svg";
import ClientImg07 from "@/public/images/client-logo-07.svg";
import ClientImg08 from "@/public/images/client-logo-08.svg";
import ClientImg09 from "@/public/images/client-logo-09.svg";

const testimonials = [
  {
    img: TestimonialImg01,
    clientImg: ClientImg01,
    name: "Maria Silva",
    company: "Paciente",
    content:
      "Depois de anos sofrendo com sinusite crônica, finalmente encontrei alívio. A Dra. Jasmin foi extremamente atenciosa, explicou todo o tratamento e me acompanhou em cada etapa. Hoje respiro muito melhor e minha qualidade de vida mudou completamente.",
    categories: [1, 2], // Rinologia (sinusite)
  },
  {
    img: TestimonialImg02,
    clientImg: ClientImg02,
    name: "Carlos Mendes",
    company: "Paciente",
    content:
      "Excelente profissional! Tratei um problema de audição que me incomodava há anos. A doutora foi muito paciente, tirou todas as minhas dúvidas e o resultado foi além das minhas expectativas.",
    categories: [1, 3], // Otologia (problema de audição)
  },
  {
    img: TestimonialImg03,
    clientImg: ClientImg03,
    name: "Ana Paula Costa",
    company: "Paciente",
    content:
      "O atendimento foi humanizado e acolhedor desde o primeiro contato. Meu filho tinha problemas recorrentes de otite e graças ao tratamento correto da Dra. Jasmin, ele está curado. Recomendo de olhos fechados!",
    categories: [1, 3], // Otologia (otite)
  },
  {
    img: TestimonialImg04,
    clientImg: ClientImg04,
    name: "Roberto Santos",
    company: "Paciente",
    content:
      "Profissional extremamente competente e atualizada. Realizei uma cirurgia de desvio de septo e o resultado foi perfeito. A recuperação foi tranquila e hoje não tenho mais aqueles problemas de congestão nasal.",
    categories: [1, 2, 5], // Rinologia + Cirurgias (cirurgia de desvio de septo)
  },
  {
    img: TestimonialImg05,
    clientImg: ClientImg05,
    name: "Juliana Oliveira",
    company: "Paciente",
    content:
      "Sofria muito com rinite alérgica e não conseguia encontrar um tratamento que funcionasse. A Dra. Jasmin foi muito detalhista no diagnóstico e encontrou a melhor solução para o meu caso. Estou muito satisfeita!",
    categories: [1, 2], // Rinologia (rinite alérgica)
  },
  {
    img: TestimonialImg06,
    clientImg: ClientImg06,
    name: "Pedro Alves",
    company: "Paciente",
    content:
      "Médica muito dedicada e atenciosa. Fiz tratamento para zumbido no ouvido e hoje estou muito melhor. Ela sempre estava disponível para tirar dúvidas e me tranquilizar durante o processo.",
    categories: [1, 3], // Otologia (zumbido no ouvido)
  },
  {
    img: TestimonialImg07,
    clientImg: ClientImg07,
    name: "Fernanda Lima",
    company: "Paciente",
    content:
      "A consulta superou minhas expectativas. A doutora me ouviu com atenção, fez todos os exames necessários e explicou cada detalhe do meu diagnóstico. Me senti muito bem cuidada.",
    categories: [1], // Todos (depoimento genérico)
  },
  {
    img: TestimonialImg08,
    clientImg: ClientImg08,
    name: "Marcelo Rocha",
    company: "Paciente",
    content:
      "Excelente otorrinolaringologista! Tratei um problema vocal que estava me prejudicando no trabalho. A Dra. Jasmin foi muito profissional e o tratamento foi eficaz. Recomendo!",
    categories: [1, 4], // Laringologia (problema vocal)
  },
  {
    img: TestimonialImg09,
    clientImg: ClientImg09,
    name: "Beatriz Ferreira",
    company: "Paciente",
    content:
      "Estava muito preocupada com minha cirurgia de sinusite, mas a Dra. Jasmin me tranquilizou e explicou tudo com muita clareza. O procedimento foi um sucesso e hoje estou livre dos sintomas que me atormentavam.",
    categories: [1, 2, 5], // Rinologia + Cirurgias (cirurgia de sinusite)
  },
];

export default function Testimonials() {
  const masonryContainer = useMasonry();
  const [category, setCategory] = useState<number>(1);

  return (
    <section id="depoimentos">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t border-[var(--color-accent)] py-12 md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center">
            <h2 className="bg-[linear-gradient(to_right,var(--color-primary),var(--color-secondary),var(--color-primary))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl">
              O que dizem meus pacientes
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)]">
              Depoimentos reais de pessoas que confiaram em nosso cuidado especializado
              e encontraram soluções para seus problemas de saúde respiratória.
            </p>
          </div>

          <div>
            {/* Buttons */}
            <div className="flex justify-center pb-12 max-md:hidden md:pb-16">
              <div className="relative inline-flex flex-wrap justify-center rounded-[1.25rem] bg-white border border-[var(--color-accent)] p-1 shadow-sm">
                {/* Button #1 */}
                <button
                  className={`flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${category === 1 ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]"}`}
                  aria-pressed={category === 1}
                  onClick={() => setCategory(1)}
                >
                  <svg
                    className={`fill-current ${category === 1 ? "text-white" : "text-[var(--color-text-muted)]"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height={16}
                  >
                    <path d="M.062 10.003a1 1 0 0 1 1.947.455c-.019.08.01.152.078.19l5.83 3.333c.052.03.115.03.168 0l5.83-3.333a.163.163 0 0 0 .078-.188 1 1 0 0 1 1.947-.459 2.161 2.161 0 0 1-1.032 2.384l-5.83 3.331a2.168 2.168 0 0 1-2.154 0l-5.83-3.331a2.162 2.162 0 0 1-1.032-2.382Zm7.854-7.981-5.83 3.332a.17.17 0 0 0 0 .295l5.828 3.33c.054.031.118.031.17.002l5.83-3.333a.17.17 0 0 0 0-.294L8.085 2.023a.172.172 0 0 0-.17-.001ZM9.076.285l5.83 3.332c1.458.833 1.458 2.935 0 3.768l-5.83 3.333c-.667.38-1.485.38-2.153-.001l-5.83-3.332c-1.457-.833-1.457-2.935 0-3.767L6.925.285a2.173 2.173 0 0 1 2.15 0Z" />
                  </svg>
                  <span>Todos</span>
                </button>
                {/* Button #2 */}
                <button
                  className={`flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${category === 2 ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]"}`}
                  aria-pressed={category === 2}
                  onClick={() => setCategory(2)}
                >
                  <svg
                    className={`fill-current ${category === 2 ? "text-white" : "text-[var(--color-text-muted)]"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height={16}
                  >
                    <path d="M6.5 3.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM9 6.855A3.502 3.502 0 0 0 8 0a3.5 3.5 0 0 0-1 6.855v1.656L5.534 9.65a3.5 3.5 0 1 0 1.229 1.578L8 10.267l1.238.962a3.5 3.5 0 1 0 1.229-1.578L9 8.511V6.855Zm2.303 4.74c.005-.005.01-.01.013-.016l.012-.016a1.5 1.5 0 1 1-.025.032ZM3.5 11A1.497 1.497 0 0 1 5 12.5 1.5 1.5 0 1 1 3.5 11Z" />
                  </svg>
                  <span>Rinologia</span>
                </button>
                {/* Button #3 */}
                <button
                  className={`flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${category === 3 ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]"}`}
                  aria-pressed={category === 3}
                  onClick={() => setCategory(3)}
                >
                  <svg
                    className={`fill-current ${category === 3 ? "text-white" : "text-[var(--color-text-muted)]"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height={16}
                  >
                    <path d="M2.428 10c.665-1.815 1.98-3.604 3.44-4.802-.6-1.807-1.443-3.079-2.29-3.18-1.91-.227-2.246 2.04-.174 2.962a1 1 0 1 1-.813 1.827C-1.407 5.028-.589-.491 3.815.032c1.605.191 2.925 1.811 3.79 4.07.979-.427 1.937-.51 2.735-.092.818.429 1.143 1.123 1.294 2.148.015.1.022.149.043.32.542-.537 1.003-.797 1.693-.622.64.162.894.493 1.195 1.147l.018.04a1 1 0 0 1 1.133 1.61c-.46.47-1.12.574-1.744.398a1.661 1.661 0 0 1-.87-.592 2.127 2.127 0 0 1-.224-.349 3.225 3.225 0 0 1-.55.477c-.377.253-.8.368-1.259.267-.993-.218-1.21-.779-1.367-2.05-.027-.22-.033-.262-.046-.353-.067-.452-.144-.617-.244-.67-.225-.118-.665-.013-1.206.278.297 1.243.475 2.587.516 3.941H15a1 1 0 0 1 0 2H8.68l-.025.285c-.173 1.918-.906 3.381-2.654 3.668-1.5.246-3.013-.47-3.677-1.858-.29-.637-.39-1.35-.342-2.095H1a1 1 0 0 1 0-2h1.428Zm2.11 0h2.175a18.602 18.602 0 0 0-.284-2.577c-.205.202-.408.42-.606.654A9.596 9.596 0 0 0 4.537 10Zm2.135 2H3.942c-.032.465.03.888.194 1.25.258.538.89.836 1.54.73.546-.09.888-.772.988-1.875L6.673 12Z" />
                  </svg>
                  <span>Otologia</span>
                </button>
                {/* Button #4 */}
                <button
                  className={`flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${category === 4 ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]"}`}
                  aria-pressed={category === 4}
                  onClick={() => setCategory(4)}
                >
                  <svg
                    className={`fill-current ${category === 4 ? "text-white" : "text-[var(--color-text-muted)]"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height={16}
                  >
                    <path d="M3.757 3.758a6 6 0 0 1 8.485 8.485 5.992 5.992 0 0 1-5.301 1.664 1 1 0 1 0-.351 1.969 8 8 0 1 0-4.247-2.218 1 1 0 0 0 1.415-.001L9.12 8.294v1.827a1 1 0 1 0 2 0v-4.2a.997.997 0 0 0-1-1.042H5.879a1 1 0 1 0 0 2h1.829l-4.599 4.598a6 6 0 0 1 .648-7.719Z" />
                  </svg>
                  <span>Laringologia</span>
                </button>
                {/* Button #5 */}
                <button
                  className={`flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-all duration-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${category === 5 ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)]"}`}
                  aria-pressed={category === 5}
                  onClick={() => setCategory(5)}
                >
                  <svg
                    className={`fill-current ${category === 5 ? "text-white" : "text-[var(--color-text-muted)]"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height={16}
                  >
                    <path d="M13.95.879a3 3 0 0 0-4.243 0L1.293 9.293a1 1 0 0 0-.274.51l-1 5a1 1 0 0 0 1.177 1.177l5-1a1 1 0 0 0 .511-.273l1.16-1.16a1 1 0 0 0-1.414-1.414l-.946.946-3.232.646.646-3.232 8.2-8.2a1 1 0 0 1 1.414 0l1.172 1.172a1 1 0 0 1 0 1.414l-.55.549a1 1 0 0 0 1.415 1.414l.55-.55a3 3 0 0 0 0-4.241L13.948.879ZM3.25 4.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm11.474 6.029-1.521-.752-.752-1.521c-.168-.341-.73-.341-.896 0l-.752 1.52-1.521.753a.498.498 0 0 0 0 .896l1.52.752.753 1.52a.5.5 0 0 0 .896 0l.752-1.52 1.52-.752a.498.498 0 0 0 0-.896Z" />
                  </svg>
                  <span>Cirurgias</span>
                </button>
              </div>
            </div>

            {/* Cards */}
            <div
              className="mx-auto grid max-w-sm items-start gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3"
              ref={masonryContainer}
            >
              {testimonials
                .filter((testimonial) => testimonial.categories.includes(category))
                .map((testimonial, index) => (
                  <div key={index} className="group">
                    <Testimonial testimonial={testimonial}>
                      {testimonial.content}
                    </Testimonial>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface TestimonialProps {
  testimonial: {
    img: StaticImageData;
    clientImg: StaticImageData;
    name: string;
    company: string;
    content: string;
    categories: number[];
  };
  children: React.ReactNode;
}

export function Testimonial({ testimonial, children }: TestimonialProps) {
  return (
    <article className="relative rounded-2xl bg-white border border-[var(--color-accent)] p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col gap-4">
        <div className="opacity-40">
          <Image src={testimonial.clientImg} height={36} alt="Client logo" />
        </div>
        <p className="text-[var(--color-text-secondary)]">
          &ldquo;{children}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <Image
            className="inline-flex shrink-0 rounded-full"
            src={testimonial.img}
            width={36}
            height={36}
            alt={testimonial.name}
          />
          <div className="text-sm font-medium text-[var(--color-text-primary)]">
            <span>{testimonial.name}</span>
            <span className="text-[var(--color-text-muted)]"> - </span>
            <span className="text-[var(--color-text-secondary)]">
              {testimonial.company}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
