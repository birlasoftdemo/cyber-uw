import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages project site: https://birlasoftdemo.github.io/cyber-uw/
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  // Allow Cloudflare / ngrok quick-tunnel hostnames during demos
  preview: {
    allowedHosts: true,
  },
  server: {
    allowedHosts: true,
  },
})
