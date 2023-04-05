import { RefinedResponse, RequestBody } from 'k6/http';

import { Request } from '@/utils/http';

import { Files } from './files';
import { Spaces } from './spaces';

export class Dav {
  protected request: Request;
  readonly files: Files;
  readonly spaces: Spaces;

  constructor(request: Request) {
    this.request = request
    this.files = new Files(request)
    this.spaces = new Spaces(request)
  }

  search(body?: RequestBody): RefinedResponse<'text'> {
    return this.request('SEARCH', '/remote.php/dav', body, {
      headers: {
        'Content-Type': 'application/xml'
      }
    });
  }
}
