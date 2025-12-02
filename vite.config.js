import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

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
    })
  ],
  server: {
<<<<<<< HEAD
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
      '/api/stripe': {
        target: 'https://admin.residente.mx',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        ws: true // Habilitar WebSocket para el proxy
      }
    }
  },
  // Variables de entorno para Stripe
  envPrefix: 'VITE_'
=======
    proxy: {
      '/fotos': {
        target: 'https://residente.mx',
        changeOrigin: true,
        secure: false,
      }
    }
  }
>>>>>>> ee596df99c02af7f07dd9607198e03f0183e83bd
})