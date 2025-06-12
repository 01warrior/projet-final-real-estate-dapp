import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path" // Module Node.js pour gérer les chemins

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Mappe l'alias "@" vers ton dossier "src"
    },
  },
})