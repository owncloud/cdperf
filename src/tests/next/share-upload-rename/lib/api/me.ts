import { check, JSONValue } from 'k6';
import http from 'k6/http';

import { Credential } from '../auth';
import { buildParams } from './utils';

export interface MeAPI {
  driveInfo(fallback: JSONValue, credential: Credential, { selector }?: { selector: string }): JSONValue;
}

export class MeLegacyAPI implements MeAPI {
  protected baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  driveInfo(fallback: JSONValue, _: Credential): JSONValue {
    return fallback;
  }
}

export class MeLatestAPI extends MeLegacyAPI implements MeAPI {
  driveInfo(fallback: JSONValue, credential: Credential, { selector }: { selector?: string } = {}): JSONValue {
    const infoResponse = http.request(
      'GET',
      `${this.baseURL}/graph/v1.0/me/drives`,
      undefined,
      buildParams({}, { credential }),
    );

    check(infoResponse, {
      'user driveInfo': ({ status }) => status === 200,
    });

    const value = infoResponse.json(selector);

    if (!!value) {
      return value;
    }

    return fallback;
  }
}
