import { RefinedResponse } from 'k6/http';

import { Request } from '@/utils/http';

export class Groups {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }
  
  create(groupid: string): RefinedResponse<'text'> {
    return this.request('POST',
      '/ocs/v2.php/cloud/groups',
      { groupid },
      {
        headers: {
          'OCS-APIRequest': 'true'
        }
      });
  }

  delete(name: string): RefinedResponse<'text'> {
    return this.request('DELETE',
      `/ocs/v2.php/cloud/groups/${name}`,
      undefined,
      {
        headers: {
          'OCS-APIRequest': 'true'
        }
      });
  }
}
