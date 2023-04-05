import { RefinedResponse } from 'k6/http';

import { Request } from '@/utils/http';

export class Me {
  protected request: Request;
  constructor(request: Request) {
    this.request = request;
  }

  drives(): RefinedResponse<'text'> {
    return this.request('GET', '/graph/v1.0/me/drives');
  }

  me(): RefinedResponse<'text'> {
    return this.request('GET', '/graph/v1.0/me?$expand=memberOf');
  }
}
