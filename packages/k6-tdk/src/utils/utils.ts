/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { randomString as _randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import * as jsonpath from 'jsonpath';
import { JSONValue } from 'k6';
import { isEmpty } from 'lodash-es';
import * as xmlbuilder from 'xmlbuilder2';

export const randomString = (length = 10, charset?: string): string => {
  return _randomString(length, charset);
};

export const queryJson = <V = any>(pathExpression: string, obj?: JSONValue): V[] => {
  if (!pathExpression || !obj) {
    return [];
  }

  if(typeof obj == 'string') {
    try {
      obj = JSON.parse(obj)
    } catch (_) {
      return []
    }
  }

  return jsonpath.query(obj, pathExpression).map((v) => {
    return isEmpty(v) ? undefined : v
  });
};

export const queryXml = <V = any>(pathExpression: string, obj?: any): V[] => {
  const jsonRepresentation = xmlbuilder.create(obj).end({ format: 'object' })
  return queryJson<V>(pathExpression, jsonRepresentation);
};

