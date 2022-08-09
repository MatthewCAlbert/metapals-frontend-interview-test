import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true
      }
    }
  }
})