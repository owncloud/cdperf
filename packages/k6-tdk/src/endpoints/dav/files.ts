import { RefinedResponse, RequestBody } from 'k6/http';

import { Request } from '@/utils/http';

export class Files {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  upload(id: string, path: string, body: RequestBody): RefinedResponse<'text'> {
    return this.request('PUT', `/remote.php/dav/files/${id}/${path}`, body);
  }

  download(id: string, path: string): RefinedResponse<'binary'> {
    return this.request('GET', `/remote.php/dav/files/${id}/${path}`);
  }

  create(id: string, path: string): RefinedResponse<'text'> {
    return this.request('MKCOL', `/remote.php/dav/files/${id}/${path}`);
  }

  delete(id: string, path: string): RefinedResponse<'text'> {
    return this.request('DELETE', `/remote.php/dav/files/${id}/${path}`);
  }

  move(id: string, from: string, to: string): RefinedResponse<'text'> {
    return this.request('MOVE', `/remote.php/dav/files/${id}/${from}`, undefined, {
      headers: {
        destination: `/remote.php/dav/files/${id}/${to}`,
      },
    });
  }

  propfind(id: string, path: string, body?: RequestBody): RefinedResponse<'text'> {
    return this.request('PROPFIND', `/remote.php/dav/files/${id}/${path}`, body);
  }

  report(id: string, body?: RequestBody): RefinedResponse<'text'> {
    return this.request('REPORT', `/remote.php/dav/files/${id}`, body);
  }
}
