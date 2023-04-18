import { RefinedResponse } from 'k6/http';

import { Request } from '@/utils/http';

export class Drives {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  create(name: string): RefinedResponse<'text'> {
    return this.request('POST', '/graph/v1.0/drives', JSON.stringify({ name }));
  }

  delete(id: string): RefinedResponse<'text'> {
    return this.request('DELETE', `/graph/v1.0/drives/${id}`);
  }
}
