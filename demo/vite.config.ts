import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "~": "./src",
    },
  },
  plugins: [viteTsConfigPaths({ projects: ["./tsconfig.json"] }), tailwindcss(), tanstackStart(), viteReact()],
});
