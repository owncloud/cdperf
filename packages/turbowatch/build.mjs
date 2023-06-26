import {build} from 'tsup';

await build({
  entryPoints: ['src/index.ts'],
  format: 'esm'
});
