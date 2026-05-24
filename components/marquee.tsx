const TERMS = [
  "Rinologia",
  "Cirurgia nasal",
  "Cirurgia endoscópica nasossinusal",
  "Sinusite",
  "Rinossinusite crônica",
  "Rinite",
  "Desvio de septo",
  "Obstrução nasal",
  "Respiração nasal",
  "Base de crânio",
  "Otologia",
  "Audição",
  "Zumbido",
  "Dor de ouvido",
  "Infecções de ouvido",
  "Tontura",
  "Labirintite",
  "Laringologia",
  "Rouquidão",
  "Alterações da voz",
  "Garganta",
  "Amigdalite",
  "Refluxo laringofaríngeo",
  "Sono e respiração",
  "Ronco",
  "Apneia do sono",
  "Otorrino infantil",
  "Adenoide",
  "Amígdalas",
  "Respiração oral",
  "Cuidado clínico e cirúrgico",
];

export default function Marquee() {
  // Duplicate the track for a seamless loop (CSS animates the inner track).
  const items = [...TERMS, ...TERMS];
  return (
    <div className="strip" aria-hidden="true">
      <div className="strip-track">
        {items.map((term, i) => (
          <span key={i} className="strip-item">
            {term}
          </span>
        ))}
      </div>
    </div>
  );
}
