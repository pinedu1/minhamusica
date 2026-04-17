import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
        '@domain': path.resolve(__dirname, './src/domain'),
        '@schemas': path.resolve(__dirname, './src/schemas'),
        '@services': path.resolve(__dirname, './src/services'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@data': path.resolve(__dirname, './src/data'),
        '@tests': path.resolve(__dirname, './src/tests'),
        '@tranposer': path.resolve(__dirname, './src/transposer'),
    }
  }
});
