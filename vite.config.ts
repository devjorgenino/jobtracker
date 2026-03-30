import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

function copyPdfWorker() {
  return {
    name: 'copy-pdf-worker',
    closeBundle() {
      const src = resolve(__dirname, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
      const destDir = resolve(__dirname, 'dist')
      const dest = resolve(destDir, 'pdf.worker.mjs')
      
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true })
      }
      
      copyFileSync(src, dest)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyPdfWorker()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
