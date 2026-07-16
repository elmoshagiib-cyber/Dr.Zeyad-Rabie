import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
  registerType: "autoUpdate",

  includeAssets: ["favicon.png"],

  manifest: {
    name: "منصة مستر زياد ربيع",
    short_name: "زياد ربيع",
    description: "منصة تعليمية لمستر زياد ربيع",

    theme_color: "#421651",
    background_color: "#ffffff",

    display: "standalone",
    orientation: "portrait",

    start_url: "/",

    icons: [
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
})],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
