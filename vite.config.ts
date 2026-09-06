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
  esbuild: {
    drop: ["console", "debugger"],
  },
  plugins: [react(), tailwindcss(), VitePWA({
  registerType: "autoUpdate",

workbox: {
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB بدل 2MB الافتراضي

  navigateFallback: "/index.html",

  runtimeCaching: [
    {
      urlPattern: ({ request }) =>
        request.destination === "image",

      handler: "CacheFirst",

      options: {
        cacheName: "images",

        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },

    {
      urlPattern: ({ request }) =>
        request.destination === "script" ||
        request.destination === "style",

      handler: "StaleWhileRevalidate",
    },
  ],
},

  includeAssets: [
  "favicon.png",
  "favicon-192.png",
  "favicon-512.png",
  "maskable-512.png"
],

manifest: {
  name: "منصة مستر زياد ربيع",
  short_name: "زياد ربيع",
  description: "منصة تعليمية لمستر زياد ربيع",

  lang: "ar",
  dir: "rtl",

  start_url: "/",
  scope: "/",

  display: "standalone",
  orientation: "landscape",

  theme_color: "#421651",
  background_color: "#ffffff",

  icons: [
    {
      src: "favicon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "favicon-512.png",
      sizes: "512x512",
      type: "image/png",
    },
    {
      src: "maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable"
    }
  ]
}
})],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // بيمنع Vite من تقسيم مكتبات زي lucide-react
        // لملف منفصل لكل أيقونة (كان بيعمل عشرات الـ requests الصغيرة).
        // بدل كده بنجمعهم في "vendor chunks" كبيرة ومحدودة العدد.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("lucide-react") || id.includes("react-icons")) {
            return "vendor-icons";
          }

          if (
            id.includes("react-router-dom") ||
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("scheduler")
          ) {
            return "vendor-react";
          }

          if (id.includes("framer-motion")) {
            return "vendor-motion";
          }

          if (id.includes("@supabase")) {
            return "vendor-supabase";
          }

          // أي مكتبة تانية من node_modules تتجمع هنا
          return "vendor";
        },
      },
    },
  },
});