import {build} from '@ownclouders/esbuild';
import path from 'path';
import fs from 'fs';

const instructions = {
  root: 'src',
  outdir: 'dist',
  entryPoints: [
    'index.ts',
    'api/index.ts',
    'auth/index.ts',
    'client/index.ts',
    'utils/index.ts',
  ],
  packageName: '@ownclouders/k6-tdk',
  packageRoot: 'lib',
  formats: ['cjs', 'esm']
}

instructions.entryPoints.forEach((entryPoint, i) => {
  const entryPointInfo = path.parse(entryPoint)
  const isVirtualPackage = !!entryPointInfo.dir

  instructions.entryPoints[i] = path.resolve(instructions.root, entryPointInfo.dir, entryPointInfo.base)

  if(isVirtualPackage){
    const packageFolder = path.resolve(instructions.packageRoot, entryPointInfo.dir)

    const data = {
      "name": path.join(instructions.packageName, entryPointInfo.dir),
    }

    ;['types', ...instructions.formats].forEach(format => {
      const key = {esm: 'import', cjs: 'require'}[format] || format
      const extension = {esm: 'js', cjs: 'js', types: 'd.ts'}[format]
      data[key] = path.relative(
        packageFolder,
        path.join(instructions.outdir, format, entryPointInfo.dir,  `${entryPointInfo.name}.${extension}`),
      )
    })

    fs.mkdirSync(packageFolder, {recursive: true})
    fs.writeFileSync(path.resolve(packageFolder, 'package.json'), JSON.stringify(data, undefined, 2))
  }
})

await Promise.all(instructions.formats.map(format => {
  return build({
    entryPoints: instructions.entryPoints,
    outdir: path.join(instructions.outdir, format),
    format: format,
    external: ['k6']
  })
}))
