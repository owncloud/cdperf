import { RefinedResponse } from 'k6/http';

import { Permission,ShareType } from '@/api/api';
import { Request } from '@/utils/http';


export class Shares {
  protected request: Request;
  constructor(request: Request) {
    this.request = request;
  }
  createShare(path: string, shareWith: string, shareType: ShareType, permissions: Permission): RefinedResponse<'text'> {
    return this.request(
      'POST',
      '/ocs/v2.php/apps/files_sharing/api/v1/shares',
      {
        shareType: shareType.toString(),
        shareWith,
        path,
        permissions: permissions.toString(),
      },
      {
        headers: {
          'OCS-APIRequest': 'true',
        },
      },
    );
  }

  acceptShare(id: string): RefinedResponse<'text'> {
    return this.request('POST', `/ocs/v2.php/apps/files_sharing/api/v1/shares/pending/${id}`, undefined, {
      headers: {
        'OCS-APIRequest': 'true',
      },
    });
  }
}
