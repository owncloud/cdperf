import { check } from 'k6';
import { RefinedResponse } from 'k6/http';
import { Endpoints, Permission, ShareType } from 'src/endpoints';

export class Share {
  #endpoints: Endpoints;

  constructor(endpoints: Endpoints) {
    this.#endpoints = endpoints;
  }

  create(path: string, shareWith: string, shareType: ShareType, permissions: Permission): RefinedResponse<'text'> {
    const response = this.#endpoints.ocs.v2.apps.filesSharing.v1.shares.create(path, shareWith, shareType, permissions);

    check(response, {
      'client -> share.create - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }

  delete(id: string): RefinedResponse<'text'> {
    const response = this.#endpoints.ocs.v2.apps.filesSharing.v1.shares.delete(id);

    check(response, {
      'client -> share.delete - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }

  accept(id: string): RefinedResponse<'text'> {
    const response = this.#endpoints.ocs.v2.apps.filesSharing.v1.shares.accept(id);

    check(response, {
      'client -> share.accept - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }
}
