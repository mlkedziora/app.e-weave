import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // ✅ Add this import
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()],  // ✅ Add tailwindcss() here
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
      '/materials': {  
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/projects': {  // ✅ Add this proxy for /projects and subpaths
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})