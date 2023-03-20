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
    input: ['src/tests/*/*.ts'],
    external: utils.createFilter(['k6/**', ...Object.keys(pkg.devDependencies)], null, { resolve: false }),
    output: [
      {
        dir: 'run',
        format: 'cjs',
        exports: 'named',
        chunkFileNames: env.production ? '_chunks/[name]-[hash].js' : '_chunks/[name].js',
      },
    ],
    onwarn: (warning, warn) => {
      // skip k6-jslib url import warnings
      if (warning.code === 'UNRESOLVED_IMPORT' && warning.source.startsWith('https://jslib.k6.io')) {
        return;
      }

      warn(warning);
    },
    plugins: [
      multiInput({
        transformOutputPath: (output, input) => {
          const [, , target, ...script] = input.split('/');
          return `${target}-${script.join('-').replace(/_/g, '-')}`;
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
