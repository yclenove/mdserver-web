import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:7200',
        changeOrigin: true,
      },
      '/files': {
        target: 'http://localhost:7200',
        changeOrigin: true,
      },
      '/site': {
        target: 'http://localhost:7200',
        changeOrigin: true,
      },
      '/system': {
        target: 'http://localhost:7200',
        changeOrigin: true,
      },
      '/do_login': {
        target: 'http://localhost:7200',
        changeOrigin: true,
      },
      '/check_login': {
        target: 'http://localhost:7200',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../static/dist'),
    assetsDir: 'assets',
    emptyOutDir: true,
    manifest: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-element': ['element-plus', '@element-plus/icons-vue'],
          'vendor-echarts': ['echarts'],
          'vendor-monaco': ['monaco-editor', '@monaco-editor/loader'],
        },
      },
    },
  },
});
