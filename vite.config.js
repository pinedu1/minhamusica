import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
    test: {
        // Mantém as exclusões originais e adiciona a sua pasta de quarentena
        exclude: [...configDefaults.exclude, '_legacy/**'],
    },
});