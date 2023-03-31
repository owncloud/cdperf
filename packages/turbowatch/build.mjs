import {build} from '@ownclouders/esbuild';

await build({
  platform:    'node',
  format:      'esm',
  packages:    'external',
});
