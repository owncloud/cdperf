/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { randomString as _randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { JSONPath } from 'jsonpath-plus';
import { JSONValue } from 'k6';
import { create } from 'xmlbuilder2';


export const randomString = (length = 10, charset?: string): string => {
  return _randomString(length, charset);
};

export const queryJson = <V extends string>(pathExpression: string, obj?: JSONValue): V[] => {
  if (!pathExpression || !obj) {
    return [];
  }

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  return new JSONPath({ json: obj, path: pathExpression });
};

export const queryXml = <V extends string>(pathExpression: string, obj?: JSONValue): V[] => {
  return queryJson<V>(pathExpression, xmlToJson(obj as any));
};

export const xmlToJson = (obj: string): any => {
  return create(obj || '').end({ format: 'object' });
};
