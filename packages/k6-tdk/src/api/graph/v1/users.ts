import { RefinedResponse } from 'k6/http';

import { Account } from '@/auth';
import { Request } from '@/utils/http';

export class Users {
  protected request: Request;
  constructor(request: Request) {
    this.request = request;
  }
  
  create(account: Account): RefinedResponse<'text'> {
    return this.request('POST',
      '/graph/v1.0/users',
      JSON.stringify({
        onPremisesSamAccountName: account.login,
        displayName: account.login,
        mail: `${account.login}@owncloud.org`,
        passwordProfile: { password: account.password },
      }),);
  }
  delete(id: string): RefinedResponse<'text'> {
    return this.request('DELETE', `/graph/v1.0/users/${id}`);
  }
}
