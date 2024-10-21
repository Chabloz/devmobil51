import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ command, mode }) => {

  const config = {
    base: '/',
    resolve: {
      alias: {
        '/utils': path.resolve(__dirname, 'src/utils'),
        '/class': path.resolve(__dirname, 'src/class'),
      },
    },
  };

  return config;
});