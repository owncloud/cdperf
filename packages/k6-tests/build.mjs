import {build} from "tsup";
import fg from "fast-glob";
import path from 'path'
import fs from 'fs'

const outdir = 'artifacts'

const buildToFromMap = (glob, stripExtension = false) => {
  return fg.sync(glob).reduce((acc, from) => {
    const fromInfo = path.parse(from)
    const [src, ...namespace] = fromInfo.dir.split('/');

    let to = [...namespace, fromInfo.name].join('-').replace(/[._]/g, '-')

    if (!stripExtension) {
      to = to + fromInfo.ext
    }

    if (src === 'src'){
      to = '_' + to
    }

    acc[to] = from

    return acc
  }, {})
}


await build({
  entry: buildToFromMap(['./{src,tests}/**/*.k6.ts'], true),
  outDir: outdir,
  minify: true,
  platform: 'browser',
  external: ['k6'],
  bundle: true,
  clean: true,
  noExternal: ['lodash', '@ownclouders/k6-tdk', 'zod'],
  splitting: true,
  sourcemap: false,
  esbuildOptions: (options) => {
    options.chunkNames = `__chunk/[name]-[hash]`;
  }
});

Object.entries(buildToFromMap('./{src,tests}/**/*.pool.json')).forEach(([to, from]) => {
  fs.copyFileSync(path.resolve(from), path.resolve(path.join(outdir, to)))
})
