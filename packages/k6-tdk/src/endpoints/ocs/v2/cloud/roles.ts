import { RefinedResponse } from 'k6/http';

import { Request } from '@/utils/http';

export class Roles {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }
  
  list(): RefinedResponse<'text'> {
    return this.request('POST',
      '/ocs/v2.php/cloud/roles',
      undefined,
      {
        headers: {
          'OCS-APIRequest': 'true',
        },
      },);
  }
}
