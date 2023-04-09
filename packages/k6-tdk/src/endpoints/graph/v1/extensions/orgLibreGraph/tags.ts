import { RefinedResponse } from 'k6/http';

import { Request } from '@/utils/http';

export class Tags {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  assign(resourceId: string, ...tags: string[]): RefinedResponse<'text'> {
    return this.request('PUT', '/graph/v1.0/extensions/org.libregraph/tags', JSON.stringify({
      resourceId,
      tags
    }));
  }

  unassign(resourceId: string, ...tags: string[]): RefinedResponse<'text'> {
    return this.request('DELETE', '/graph/v1.0/extensions/org.libregraph/tags', JSON.stringify({
      resourceId,
      tags
    }));
  }
}
