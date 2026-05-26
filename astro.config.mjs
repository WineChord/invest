import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.wineandchord.com",
  base: "/invest",
  output: "static",
  integrations: [react()],
  build: {
    format: "preserve",
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 700,
    },
  },
});
