import { check } from 'k6';
import { RefinedResponse } from 'k6/http';

import { endpoints, Permission, ShareType  } from '@/endpoints';
import { Request } from '@/utils';

export class Share {

  #request: Request;

  constructor(request: Request) {
    this.#request = request;
  }

  create(path: string, shareWith: string, shareType: ShareType, permissions: Permission): RefinedResponse<'text'> {
    const response = endpoints.ocs.v2.apps.file_sharing.v1.shares.POST__create_share(this.#request, {
      shareResourcePath: path,
      shareType: shareType,
      shareReceiverPermission: permissions,
      shareReceiverId: shareWith
    })

    check(response, {
      'client -> share.create - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }

  delete(id: string): RefinedResponse<'text'> {
    const response = endpoints.ocs.v2.apps.file_sharing.v1.shares.DELETE__delete_share(this.#request, { shareId: id });
    check(response, {
      'client -> share.delete - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }

  accept(id: string): RefinedResponse<'text'> {
    const response = endpoints.ocs.v2.apps.file_sharing.v1.shares.POST__accept_share(this.#request, { shareId: id });
    check(response, {
      'client -> share.accept - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }
}
