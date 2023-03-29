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
