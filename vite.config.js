import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      config: {
        content: [
          "./index.html",
          "./src/**/*.{js,ts,jsx,tsx}",
        ],
        theme: {
          extend: {
            colors: {
              amarillo: '#FFF200',
            },
            fontFamily: {
              'display-bold': 'var(--font-display-bold)',
              'body-roman': 'var(--font-body-roman)',
              'bold': 'var(--font-bold)',
            }
          }
        }
      }
    }),
    // 🚀 Service Worker para cache (sin PWA/manifest)
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Sin manifest - solo cache
      manifest: false,
      workbox: {
        // Archivos a precachear
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // 🚀 Estrategias de cache en runtime
        runtimeCaching: [
          // Assets estáticos - CacheFirst (sirve del cache, muy rápido)
          {
            urlPattern: /\.(js|css|woff2?)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              }
            }
          },
          // Imágenes locales - StaleWhileRevalidate
          {
            urlPattern: /\.(png|jpg|jpeg|webp|gif|svg|ico)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 días
              }
            }
          },
          // API Notas - NetworkFirst (intenta red, fallback cache)
          {
            urlPattern: /\/api\/notas/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-notas',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hora
              },
              networkTimeoutSeconds: 5
            }
          },
          // API Recetas - NetworkFirst
          {
            urlPattern: /\/api\/recetas/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-recetas',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hora
              },
              networkTimeoutSeconds: 5
            }
          },
          // API Usuarios - NetworkFirst
          {
            urlPattern: /\/api\/usuarios/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-usuarios',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 30 // 30 minutos
              },
              networkTimeoutSeconds: 5
            }
          },

        ]
      }
    })
  ],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173
    },
    proxy: {
      '/api/gemini': {
        target: 'https://admin.residente.mx',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        ws: true
      },
      '/api/stripe': {
        target: 'https://admin.residente.mx',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        ws: true // Habilitar WebSocket para el proxy
      },
      '/api/stripe-suscripciones': {
        target: 'https://admin.residente.mx',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        ws: true
      },
      '/api/tienda': {
        target: 'https://admin.residente.mx',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        ws: true
      },
      '/fotos': {
        target: 'https://residente.mx',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // Variables de entorno para Stripe
  envPrefix: 'VITE_'
})