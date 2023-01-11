// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { URLSearchParams } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { RefinedResponseBody, ResponseType } from 'k6/http';
import { DOMParser } from 'xmldom';

export const randomString = ({ length = 10 }: { length?: number } = {}): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;
};

export const objectToQueryString = (o: { [key: string]: string | number }): string => {
  return Object.keys(o)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(o[key]))
    .join('&');
};

export const queryStringToObject = (qs: string): { [key: string]: string } => {
  try {
    const url = new URL(qs);
    qs = url.search;
  } catch (e) {}

  return Object.fromEntries(new URLSearchParams(qs));
};

export const parseXML = (body: RefinedResponseBody<ResponseType>): Document => {
  return new DOMParser().parseFromString(body as string, 'text/xml');
};
