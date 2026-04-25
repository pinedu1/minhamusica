import { configDefaults } from 'vitest/config';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
	    '@factory': path.resolve(__dirname, './src/factory'),
        '@domain': path.resolve(__dirname, './src/domain'),
        '@schemas': path.resolve(__dirname, './src/schemas'),
        '@services': path.resolve(__dirname, './src/services'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@data': path.resolve(__dirname, './src/data'),
        '@tests': path.resolve(__dirname, './src/tests'),
        '@tranposer': path.resolve(__dirname, './src/transposer'),
	    '@adapters': path.resolve(__dirname, './src/adapters'),
	    '@abcjs': path.resolve(__dirname, './src/adapters/abcjs'),
	    '@persistence': path.resolve(__dirname, './src/adapters/persistence')
    }
  }
	, test: {
		// Mantém as exclusões originais e adiciona a sua pasta de quarentena
		exclude: [...configDefaults.exclude, '_legacy/**'],
	}
});
