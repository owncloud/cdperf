import { build } from 'esbuild';

await build({
	entryPoints: ['src/index.ts'],
	bundle:      true,
	target:      ['es2022'],
	platform:    'node',
	format:      'esm',
	sourcemap:   true,
	outdir:      'dist',
	packages:    'external',
});
