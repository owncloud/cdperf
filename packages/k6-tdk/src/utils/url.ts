/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { URLSearchParams as _URLSearchParams } from 'https://jslib.k6.io/url/1.0.0/index.js';

export class URLSearchParams {
  #ref: [];

  constructor(p: unknown) {
    this.#ref = new _URLSearchParams(p);
  }
  object(): { [p: string]: string } {
    return Object.fromEntries(this.#ref);
  }
}

export const cleanURL = (...parts: string[]): string => {
  return parts.join('/').replace(/(?<!:)\/+/gm, '/');
};

export const objectToQueryString = (o: { [key: string]: string | number }): string => {
  return Object.keys(o)
    .map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(o[ key ] || '')
    })
    .join('&');
};

export const queryStringToObject = (qs?: string): { [key: string]: string } => {
  return new URLSearchParams(new URL(qs || '').search).object();
};
