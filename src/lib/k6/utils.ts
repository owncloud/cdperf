/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { randomString as _randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const randomString = (length = 10, charset?: string): string => {
  return _randomString(length, charset);
};
