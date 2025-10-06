import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true, 
    rollupOptions: {
      input: './index.html'
    }
  },
  server: {
    host: true,
    port: 8080
  }
})


