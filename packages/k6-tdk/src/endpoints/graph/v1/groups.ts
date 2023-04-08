import { RefinedResponse } from 'k6/http';

import { Request } from '@/utils/http';

export class Groups {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  create(displayName: string): RefinedResponse<'text'> {
    return this.request('POST',
      '/graph/v1.0/groups',
      JSON.stringify({
        displayName,
      }),);
  }

  delete(displayName: string): RefinedResponse<'text'> {
    return this.request('DELETE', `/graph/v1.0/groups/${displayName}`);
  }
}
