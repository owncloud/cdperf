import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import utils from '@rollup/pluginutils';
import babel from 'rollup-plugin-babel';
import multiInput from 'rollup-plugin-multi-input';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const env = {
  production: !process.env.ROLLUP_WATCH,
};
const conf = {
  extensions: ['.js', '.ts'],
};

export default [
  {
    input: [
      'src/tests/**/*.ts',
      '!src/tests/**/*.lib.ts',
      '!src/tests/**/index.ts',
      '!src/tests/**/_*.ts',
      '!src/tests/**/lib/*.ts',
    ],
    external: utils.createFilter(['k6/**', ...Object.keys(pkg.devDependencies)], null, { resolve: false }),
    output: [
      {
        dir: 'tests',
        format: 'cjs',
        exports: 'named',
        chunkFileNames: env.production ? '_chunks/[name]-[hash].js' : '_chunks/[name].js',
      },
    ],
    plugins: [
      multiInput({
        transformOutputPath: (output, input) => {
          const [, , target, ...script] = input.split('/');
          return `${target}/${script.join('-').replace(/_/g, '-')}`;
        },
      }),
      json(),
      resolve({
        extensions: conf.extensions,
      }),
      commonjs(),
      babel({
        extensions: conf.extensions,
        include: ['src/**/*'],
      }),
      env.production && terser(),
    ],
  },
];
