import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/systems': resolve(__dirname, 'src/systems'),
      '@/entities': resolve(__dirname, 'src/entities'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/debug': resolve(__dirname, 'src/debug'),
      '@/test-utils': resolve(__dirname, 'test-utils'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  define: {
    // 開発環境でのデバッグAPI有効化
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});