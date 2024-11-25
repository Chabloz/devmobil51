import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

export default defineConfig(({ command, mode }) => {

  const config = {
    base: '/',
    plugins: [
      vue({template: { transformAssetUrls }}),
      quasar(),
    ],
    server: {
      proxy : {
        '/api/': {
          target: 'https://demo.archioweb.ch/',
          changeOrigin: true,
        }
      },
    },
    resolve: {
      alias: {
        '/utils': path.resolve(__dirname, 'src/utils'),
        '/class': path.resolve(__dirname, 'src/class'),
      },
    },
    root: path.resolve(__dirname, 'src/frontend'),
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, 'src/frontend') + '/index.html',
      }
    }
  };

  return config;
});