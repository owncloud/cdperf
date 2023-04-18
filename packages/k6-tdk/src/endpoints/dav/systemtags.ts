import { RefinedResponse, RequestBody } from 'k6/http';

import { Request } from '@/utils/http';

export class Systemtags {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  create(name: string, canAssign = true, userAssignable = true, userVisible = true): RefinedResponse<'text'> {
    return this.request('POST', '/remote.php/dav/systemtags/', JSON.stringify({
      name,
      canAssign,
      userAssignable,
      userVisible
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  delete(id: string): RefinedResponse<'text'> {
    return this.request('DELETE', `/remote.php/dav/systemtags/${id}`);
  }

  list(body?: RequestBody): RefinedResponse<'text'> {
    return this.request('PROPFIND', '/remote.php/dav/systemtags/', body);
  }
}
