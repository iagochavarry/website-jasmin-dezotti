export default function StructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": ["MedicalBusiness", "Physician"],
        "name": "Dra. Jasmin Dezotti Lovisi",
        "medicalSpecialty": ["Otorhinolaryngologic"],
        "url": "https://jasmindezotti.com/",
        "telephone": "+55-21-99718-0604",
        "address": [
            {
                "@type": "PostalAddress",
                "streetAddress": "R. Soares Caldeira, 142 - 1113",
                "addressLocality": "Madureira",
                "addressRegion": "RJ",
                "postalCode": "21351-080",
                "addressCountry": "BR"
            },
            {
                "@type": "PostalAddress",
                "streetAddress": "Rua Professor Alvaro Rodrigues, 277",
                "addressLocality": "Rio de Janeiro",
                "addressRegion": "RJ",
                "addressCountry": "BR"
            }
        ],
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": -22.949,
            "longitude": -43.186
        },
        "openingHours": "Mo-Fr 09:00-19:00",
        "priceRange": "R$",
        "areaServed": ["Rio de Janeiro", "Madureira", "Zona Sul", "Botafogo"],
        "sameAs": [
            "https://wa.me/+5521997180604",
            "https://wa.me/+5521997734282"
        ],
        "description": "Otorrinolaringologista especializada em rinologia, otologia e laringologia. Atendimento de excelência e tratamentos personalizados no Rio de Janeiro.",
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Serviços Médicos",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "MedicalProcedure",
                        "name": "Consulta Otorrinolaringológica"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "MedicalProcedure",
                        "name": "Tratamento de Rinite Alérgica"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "MedicalProcedure",
                        "name": "Tratamento de Sinusite"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "MedicalProcedure",
                        "name": "Cirurgia de Septo Nasal"
                    }
                }
            ]
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
