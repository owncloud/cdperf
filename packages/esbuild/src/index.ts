import { build as _build, BuildOptions, BuildResult } from 'esbuild';

export const build = async (config?: BuildOptions): Promise<BuildResult> => {
  return _build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    treeShaking: true,
    outdir: 'dist',
    format: 'esm',
    minify: true,
    sourcemap: false,
    platform: 'node',
    ...config
  });
};
