import {build} from "@ownclouders/esbuild";
import fg from "fast-glob";
import path from 'path'

const sources = await fg('./src/**/*.test.ts')
const entryPoints = sources.reduce((acc, source) => {
	const sourceInfo = path.parse(source)
	const [,, ...namespace] = sourceInfo.dir.split('/');

	acc[[...namespace, sourceInfo.name].join('-').replace(/[._]/g, '-')] = source

	return acc
}, {})

await build({
	entryPoints,
	outdir: "artifacts",
  format: 'cjs',
  platform: 'browser',
	external: ['k6'],
});


