import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Abracanm - Associação Brasileira de Cannabis Medicinal",
    short_name: "Abracanm",
    description:
      "Abracanm: informação segura, acolhimento e orientação para pacientes e prescritores sobre cannabis medicinal no Brasil.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#6B7C59",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64 32x32 24x24 16x16",
        type: "image/x-icon",
      },
    ],
  };
}
