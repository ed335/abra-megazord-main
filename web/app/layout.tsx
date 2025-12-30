import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { WhatsAppFloatButton } from "@/components/ui/whatsapp-float-button";
import "./globals.css";

const siteUrl = new URL("https://abracanm.com");
const ogImage = `${siteUrl.toString().replace(/\/$/, "")}/og.jpg`;
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Abracanm - Associação Brasileira de Cannabis Medicinal",
  url: siteUrl.toString(),
  sameAs: [
    "https://www.instagram.com/abracann_/",
  ],
  description:
    "Abracanm: Associação Brasileira de Cannabis Medicinal. Informação segura, acolhimento e orientação para pacientes e prescritores no Brasil.",
  logo: ogImage,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Brasília",
    addressRegion: "DF",
    addressCountry: "BR",
  },
};
const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: siteUrl.toString(),
  name: "Abracanm - Associação Brasileira de Cannabis Medicinal",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl.toString()}?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  icons: {
    icon: '/icon.svg',
  },
  title: "Abracanm - Associação Brasileira de Cannabis Medicinal",
  description:
    "Abracanm: Associação Brasileira de Cannabis Medicinal. Informação segura, acolhimento, orientação a pacientes e prescritores, e conteúdos confiáveis sobre tratamento com cannabis.",
  keywords: [
    "Abracanm",
    "Associação Brasileira de Cannabis Medicinal",
    "cannabis medicinal",
    "tratamento com cannabis",
    "prescrição médica",
    "pacientes",
    "educação em saúde",
    "saúde integral",
    "acolhimento",
    "LGPD",
  ],
  authors: [{ name: "Abracanm" }],
  applicationName: "Abracanm",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl.toString(),
    title: "Abracanm - Associação Brasileira de Cannabis Medicinal",
    description:
      "Abracanm: informação segura, acolhimento e orientação para pacientes e prescritores sobre cannabis medicinal no Brasil.",
    siteName: "Abracanm",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Abracanm - Associação Brasileira de Cannabis Medicinal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abracanm - Associação Brasileira de Cannabis Medicinal",
    description:
      "Associação Brasileira de Cannabis Medicinal com foco em acolhimento, orientação e conteúdo seguro para pacientes e prescritores.",
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-off-white text-cinza-escuro">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        {children}
        <Toaster position="top-right" richColors />
        <WhatsAppFloatButton />
      </body>
    </html>
  );
}
