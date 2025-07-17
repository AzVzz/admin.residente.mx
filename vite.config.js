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
  ]
})