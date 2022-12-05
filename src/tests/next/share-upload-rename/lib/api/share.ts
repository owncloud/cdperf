import { check } from 'k6';
import http from 'k6/http';

import { types, utils } from '../../../../../lib';
import { buildParams } from './utils';

export class ShareAPI {
  protected baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  create(
    path: string,
    credential: types.Credential,
    recipient: string,
    { permissions = '31', type = '0' }: { permissions?: string; type?: string } = {},
  ): { id: string } {
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

    check(createResponse, {
      'share create': ({ status }) => status === 200,
    });

    return {
      id: utils.parseXML(createResponse.body).getElementsByTagName('id')[0].childNodes[0].textContent!,
    };
  }

  accept(id: string, credential: types.Credential): void {
    const acceptResponse = http.request(
      'POST',
      `${this.baseURL}/ocs/v1.php/apps/files_sharing/api/v1/shares/pending/${id}`,
      undefined,
      buildParams({ headers: { 'OCS-APIRequest': 'true' } }, { credential }),
    );

    check(acceptResponse, {
      'share accept': ({ status }) => status === 200,
    });
  }
}
