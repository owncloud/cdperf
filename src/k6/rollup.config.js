import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import utils from '@rollup/pluginutils';
import babel from 'rollup-plugin-babel';
import multiInput from 'rollup-plugin-multi-input';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const extensions = ['.js', '.ts'];

export default [
    {
        input: ['src/test/**/*.ts', '!src/test/**/*.lib.ts', '!src/test/**/index.ts', '!src/test/**/_*.ts'],
        external: utils.createFilter(['k6/**', ...Object.keys(pkg.devDependencies)], null, { resolve: false }),
        output: [
            {
                dir: 'dist',
                format: 'cjs',
                exports: 'named',
                chunkFileNames: '_chunks/[name]-[hash].js',
            },
        ],
        plugins: [
            multiInput({
                transformOutputPath: (output, input) => `${output.split('/').join('-').replace(/_/g, '-')}`,
            }),
            json(),
            resolve({
                extensions,
            }),
            commonjs(),
            babel({
                extensions,
                include: ['src/**/*'],
            }),
            terser(),
        ],
    },
];
