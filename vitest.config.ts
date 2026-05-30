import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/**/*.spec.ts'],
        exclude: [...configDefaults.exclude, 'tests/e2e/**'],
        environment: 'node',
        testTimeout: 30000,
        globals: false,
        reporters: ['default'],
    },
});
