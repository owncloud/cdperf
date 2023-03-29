import { build as _build, BuildOptions, BuildResult } from 'esbuild';

export const build = async (config?: BuildOptions): Promise<BuildResult> => {
  return _build({
    entryPoints: ['src/index.ts'],
    target: ['es2022'],
    bundle: true,
    treeShaking: true,
    outdir: 'dist',
    format: 'esm',
    platform: 'node',
    ...config
  })
};
