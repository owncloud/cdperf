import { RefinedResponse } from 'k6/http';

import { Account } from '@/auth';
import { Request } from '@/utils/http';

export class Users {
  protected request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  enable(id: string): RefinedResponse<'text'> {
    return this.request('PUT', `/ocs/v2.php/cloud/users/${id}/enable`, undefined, {
      headers: {
        'OCS-APIRequest': 'true',
      },
    });
  }

  create(account: Account): RefinedResponse<'text'> {
    return this.request('POST',
      '/ocs/v2.php/cloud/users',
      { userid: account.login, password: account.password, email: `${account.login}@owncloud.org` },
      {
        headers: {
          'OCS-APIRequest': 'true',
        },
      });
  }

  delete(id: string): RefinedResponse<'text'> {
    return this.request('DELETE', `/ocs/v2.php/cloud/users/${id}`, undefined, {
      headers: {
        'OCS-APIRequest': 'true',
      },
    });
  }
}
