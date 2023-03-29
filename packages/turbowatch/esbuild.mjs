import {build} from '@ownclouders/esbuild';

await build({
  target:      [
    'es2022'
  ],
  platform:    'node',
  format:      'esm',
  packages:    'external',
});
