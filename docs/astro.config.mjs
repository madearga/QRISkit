import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [
    starlight({
      title: "qriskit",
      description:
        "Zero-dependency, runtime-agnostic TypeScript toolkit for QRIS — parse, validate & convert static→dynamic.",
      defaultLocale: "id",
      locales: {
        id: { label: "Bahasa Indonesia", lang: "id" },
        en: { label: "English", lang: "en" },
      },
      editLink: { enabled: false },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/madearga/QRISkit",
        },
      ],
    }),
    mdx(),
  ],
});
