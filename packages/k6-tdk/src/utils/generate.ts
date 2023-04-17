// @ts-ignore
import { randomString as k6RandomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const randomString = (length = 10, charset?: string): string => {
  return k6RandomString(length, charset);
};
