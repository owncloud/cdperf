import {build} from '@ownclouders/esbuild';
import path from 'path';
import fs from 'fs';

const instructions = {
  root: 'src',
  outdir: 'dist',
  entryPoints: [
    'index.ts',
    'auth/index.ts',
    'client/index.ts',
    'endpoints/index.ts',
    'snippets/index.ts',
    'utils/index.ts',
  ],
  packageName: '@ownclouders/k6-tdk',
  packageRoot: 'lib',
  formats: ['cjs', 'esm']
}

await Promise.all(instructions.formats.map(format => {
  return build({
    entryPoints: instructions.entryPoints.map(entryPoint => path.join(instructions.root, entryPoint)),
    outdir: path.join(instructions.outdir, format),
    format: format,
    packages: 'external',
  })
}))

instructions.entryPoints.forEach((entryPoint) => {
  const entryPointInfo = path.parse(entryPoint)
  const isVirtualPackage = !!entryPointInfo.dir

  if (!isVirtualPackage) {
    return
  }

  const packageFolder = path.resolve(instructions.packageRoot, entryPointInfo.dir)
  const data = {
      name: path.join(instructions.packageName, entryPointInfo.dir),
      sideEffects: false,
    }

  ;['types', ...instructions.formats].forEach(format => {
    const key = {esm: 'import', cjs: 'require'}[format] || format
    const extension = {esm: 'js', cjs: 'js', types: 'd.ts'}[format]
    data[key] = path.relative(
      packageFolder,
      path.join(instructions.outdir, format, entryPointInfo.dir, `${entryPointInfo.name}.${extension}`),
    )
  })

  fs.mkdirSync(packageFolder, {recursive: true})
  fs.writeFileSync(path.resolve(packageFolder, 'package.json'), JSON.stringify(data, undefined, 2))
})
