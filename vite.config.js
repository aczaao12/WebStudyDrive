import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('src/lesson-content')) {
            // Create a chunk for each lesson content file
            const match = id.match(/src\/lesson-content\/(.*)\.(jsx|js|ts|tsx)$/);
            if (match && match[1]) {
              return 'lesson-content/' + match[1];
            }
          }
        },
      },
    },
  },
})
