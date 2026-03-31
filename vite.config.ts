import { defineConfig } from 'vite';

export default defineConfig({
  base: '/pretext-toy/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        basic: 'samples/basic/index.html',
        canvas: 'samples/canvas/index.html',
        chat: 'samples/chat/index.html',
        multilingual: 'samples/multilingual/index.html',
      },
    },
  },
});
