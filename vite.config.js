import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/

export default defineConfig({
  // Base path /admin/ necesario para proxy inverso
  base: "/admin/",
  plugins: [
    react(),
    tailwindcss({
      config: {
        content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
        theme: {
          extend: {
            colors: {
              amarillo: "#FFF200",
            },
            fontFamily: {
              "display-bold": "var(--font-display-bold)",
              "body-roman": "var(--font-body-roman)",
              bold: "var(--font-bold)",
            },
          },
        },
      },
    }),
    // Service Worker (sin manifest). NO usar CacheFirst en JS/HTML: tras un
    // deploy deja la version vieja pegada y Ctrl+R no alcanza.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: { enabled: false },
      manifest: false,
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // Borra precache de builds anteriores al activar el SW nuevo.
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        navigateFallback: "/admin/index.html",
        // No interceptar archivos con extension (evita SPA fallback en .js).
        navigateFallbackDenylist: [
          /^\/api\//,
          /\.(js|css|map|json|webp|avif|jpg|jpeg|png|gif|svg|woff2?|ttf|ico)(\?.*)?$/i,
        ],
        runtimeCaching: [
          // Shell HTML + SW: red primero para pillar el deploy nuevo.
          {
            urlPattern: /\/admin\/(index\.html)?$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "html-shell",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 60 * 60,
              },
            },
          },
          {
            urlPattern: /\/admin\/sw\.js$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "html-shell",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 2,
                maxAgeSeconds: 60,
              },
            },
          },
          // JS/CSS: NetworkFirst (CacheFirst de 1 año dejaba chunks viejos vivos).
          {
            urlPattern: /\.(js|css)$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "static-assets",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
          // Fuentes
          {
            urlPattern: /\.woff2?$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "fonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          // Imágenes locales
          {
            urlPattern: /\.(png|jpg|jpeg|webp|gif|svg|ico)$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          // APIs
          {
            urlPattern: /\/api\/notas/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-notas",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60,
              },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\/api\/recetas/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-recetas",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60,
              },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /\/api\/usuarios/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-usuarios",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 30,
              },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0", // Permite acceso desde fuera del contenedor
    port: 5173,
    strictPort: false,
    watch: {
      usePolling: true, // Necesario para hot reload en Docker
    },
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
      clientPort: 5173,
    },
    // En desarrollo, el proxy apunta al servidor de producción
    proxy: {
      "/api/gemini": {
        target: process.env.VITE_API_URL || "https://admin.residente.mx",
        changeOrigin: true,
        secure: true,
      },
      "/api/stripe": {
        target: process.env.VITE_API_URL || "https://admin.residente.mx",
        changeOrigin: true,
        secure: true,
      },
      "/api/stripe-suscripciones": {
        target: process.env.VITE_API_URL || "https://admin.residente.mx",
        changeOrigin: true,
        secure: true,
      },
      "/api/tienda": {
        target: process.env.VITE_API_URL || "https://admin.residente.mx",
        changeOrigin: true,
        secure: true,
      },
      "/api/productosb2b": {
        target: process.env.VITE_API_URL || "https://admin.residente.mx",
        changeOrigin: true,
        secure: true,
      },
      "/api/usuariosb2b": {
        target: process.env.VITE_API_URL || "https://admin.residente.mx",
        changeOrigin: true,
        secure: true,
      },
      "/api/cliente-media": {
        target: process.env.VITE_API_URL || "https://admin.residente.mx",
        changeOrigin: true,
        secure: true,
      },
      "/api/productos-b2c": {
        target: process.env.VITE_API_URL || "https://admin.residente.mx",
        changeOrigin: true,
        secure: true,
      },
      "/api/tienda-b2c": {
        target: process.env.VITE_API_URL || "https://admin.residente.mx",
        changeOrigin: true,
        secure: true,
      },
      "/api/eventos": {
        target: process.env.VITE_API_URL || "https://admin.residente.mx",
        changeOrigin: true,
        secure: true,
      },
      "/fotos": {
        target: "https://residente.mx",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Variables de entorno para Stripe
  envPrefix: "VITE_",
});
