import { RefinedResponse } from 'k6/http';

import { Request } from '@/utils/http';

export class Applications {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  list(): RefinedResponse<'text'> {
    return this.request('GET', '/graph/v1.0/applications');
  }
}
