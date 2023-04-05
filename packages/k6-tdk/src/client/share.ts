import { check } from 'k6';
import { RefinedResponse } from 'k6/http';

import { Api, Permission, ShareType } from '@/api';

export class Share {
  #api: Api;
  constructor(api: Api) {
    this.#api = api;
  }

  create(path: string, shareWith: string, shareType: ShareType, permissions: Permission): RefinedResponse<'text'> {
    const response = this.#api.ocs.v2.apps.filesSharing.v1.shares.create(path, shareWith, shareType, permissions);

    check(response, {
      'client -> share.create - status': ({ status }) => {
        return status === 200
      },
    });

    return response;
  }

  accept(id: string): RefinedResponse<'text'> {
    const response = this.#api.ocs.v2.apps.filesSharing.v1.shares.accept(id);

    check(response, {
      'client -> share.accept - status': ({ status }) => {
        return status === 200
      },
    });

    return response;
  }
}
