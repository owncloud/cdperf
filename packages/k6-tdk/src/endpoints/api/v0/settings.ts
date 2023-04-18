import { RefinedResponse } from 'k6/http';

import { Request } from '@/utils/http';

export class Settings {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  rolesList(): RefinedResponse<'text'> {
    return this.request('POST', '/api/v0/settings/roles-list', JSON.stringify({}));
  }
}
