import {defineConfig} from 'vitest/config';

// Only run TypeScript test files under `tests/` (and optionally src/*.test.ts)
// Exclude any compiled .js test artifacts or the dist/ output to avoid
// importing Vitest via CommonJS in generated files.
export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
		exclude: ['**/*.js', 'dist/**', 'node_modules/**'],
	},
});
