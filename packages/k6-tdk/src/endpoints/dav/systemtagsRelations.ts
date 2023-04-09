import { RefinedResponse, RequestBody } from 'k6/http';

import { Request } from '@/utils/http';

export class SystemtagsRelations {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  assign(fileId: string, tagId: string ): RefinedResponse<'text'> {
    return this.request('PUT', `/remote.php/dav/systemtags-relations/files/${fileId}/${tagId}`)
  }

  unassign(fileId: string, tagId: string ): RefinedResponse<'text'> {
    return this.request('DELETE', `/remote.php/dav/systemtags-relations/files/${fileId}/${tagId}`)
  }

  propfind(fileId: string, body?: RequestBody): RefinedResponse<'text'> {
    return this.request('PROPFIND', `/remote.php/dav/systemtags-relations/files/${fileId}`, body)
  }
}
