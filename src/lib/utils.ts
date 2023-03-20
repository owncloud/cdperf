// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RefinedResponseBody, ResponseType } from 'k6/http';
import { DOMParser } from 'xmldom';

import { URLSearchParams } from './k6/url';

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

  return new URLSearchParams(qs).object();
};

export const parseXML = (body: RefinedResponseBody<ResponseType>): Document => {
  return new DOMParser().parseFromString(body as string, 'text/xml');
};
