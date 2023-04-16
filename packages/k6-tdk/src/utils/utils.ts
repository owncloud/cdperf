// @ts-ignore
import { randomString as _randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import * as jsonpath from 'jsonpath';
import { check as k6Check, Checkers, JSONValue } from 'k6';
import { isEmpty } from 'lodash-es';
import * as xmlbuilder from 'xmlbuilder2';

import { Platform } from '@/client';

export const randomString = (length = 10, charset?: string): string => {
  return _randomString(length, charset);
};

export const queryJson = <V = any>(pathExpression: string, val?: JSONValue): V[] => {
  if (!pathExpression || !val) {
    return [];
  }

  let obj = val;

  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj);
    } catch (_) {
      return [];
    }
  }

  return jsonpath.query(obj, pathExpression).map((v) => {
    return (isEmpty(v) ? undefined : v);
  });
};

export const queryXml = <V = any>(pathExpression: string, obj?: any): V[] => {
  const jsonRepresentation = xmlbuilder.create(obj).end({ format: 'object' });
  return queryJson<V>(pathExpression, jsonRepresentation);
};

export const check = <VT>(
  options: {
    val: VT,
    tags?: object,
    skip?: boolean
  },
  sets: Checkers<VT>
) => {
  const checkers = { ...sets }

  if (options.skip) {
    Object.keys(checkers).forEach((k) => {
      checkers[`${k} -- (SKIPPED)`] = () => {
        return true
      }

      delete checkers[k]
    })
  }

  k6Check<VT>(options.val, checkers, options.tags)
}

export const platformGuard = (platform: Platform) => {
  return {
    isOwnCloudInfiniteScale: platform === Platform.ownCloudInfiniteScale,
    isOwnCloudServer: platform === Platform.ownCloudServer,
    isNextcloud: platform === Platform.nextcloud
  }
}
