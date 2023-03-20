import { check, fail } from 'k6';
import http from 'k6/http';

import { Credential } from '../auth';
import { parseXML } from '../utils';
import { Result } from './api';
import { buildParams } from './utils';

export class ShareAPI {
  protected baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  create(
    path: string,
    credential: Credential,
    recipient: string,
    { permissions = '31', type = '0' }: { permissions?: string; type?: string } = {},
  ): { id: string } & Result {
    const createResponse = http.request(
      'POST',
      `${this.baseURL}/ocs/v1.php/apps/files_sharing/api/v1/shares`,
      {
        shareType: type,
        shareWith: recipient,
        path,
        permissions,
      },
      buildParams({ headers: { 'OCS-APIRequest': 'true' } }, { credential }),
    );

    if (
      !check(createResponse, {
        'share create': ({ status }) => status === 200,
      })
    ) {
      fail(`Share create failed with status ${createResponse.status}`);
    }

    const id = parseXML(createResponse.body).getElementsByTagName('id')[0];
    if (!id) {
      fail('XML does not contain the id');
    }

    return {
      id: id.childNodes[0].textContent || '',
      response: createResponse,
    };
  }

  accept(id: string, credential: Credential): Result {
    const acceptResponse = http.request(
      'POST',
      `${this.baseURL}/ocs/v1.php/apps/files_sharing/api/v1/shares/pending/${id}`,
      undefined,
      buildParams({ headers: { 'OCS-APIRequest': 'true' } }, { credential }),
    );

    check(acceptResponse, {
      'share accept': ({ status }) => status === 200,
    });

    return {
      response: acceptResponse,
    };
  }
}
