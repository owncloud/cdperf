import { check } from 'k6';
import http from 'k6/http';

import { Account, Adapter, Auth, Credential } from '../auth';
import { buildParams } from './utils';

export interface User {
  login: string;
  password: string;
  credential: Credential;
}

export interface UserAPI {
  get(account: Account, adapter: Adapter): User;
  enable(account: Account, credential: Credential): void;
  create(account: Account, credential: Credential, adapter: Adapter): User;
  delete(id: string, credential: Credential): void;
}

export class UserLegacyAPI implements UserAPI {
  protected baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  get(account: Account, adapter: Adapter): User {
    const { credential } = new Auth({ login: account.login, password: account.password }, adapter, this.baseURL);

    return {
      login: account.login,
      password: account.password,
      credential,
    };
  }

  enable(account: Account, credential: Credential): void {
    const enableResponse = http.request(
      'PUT',
      `${this.baseURL}/ocs/v1.php/cloud/users/${account.login}/enable`,
      undefined,
      buildParams(
        {
          headers: {
            'OCS-APIRequest': 'true',
          },
        },
        { credential },
      ),
    );

    check(enableResponse, {
      'user enable': (r) => r.status === 200,
    });
  }

  create(account: Account, credential: Credential, adapter: Adapter) {
    const createResponse = http.request(
      'POST',
      `${this.baseURL}/ocs/v1.php/cloud/users`,
      { userid: account.login, password: account.password, email: `${account.login}@owncloud.org` },
      buildParams(
        {
          headers: {
            'OCS-APIRequest': 'true',
          },
        },
        { credential },
      ),
    );

    check(createResponse, {
      'user create': (r) => r.status === 200,
    });

    this.enable(account, credential);

    return this.get(account, adapter);
  }

  delete(id: string, credential: Credential): void {
    const deleteResponse = http.request(
      'DELETE',
      `${this.baseURL}/ocs/v1.php/cloud/users/${id}`,
      undefined,
      buildParams(
        {
          headers: {
            'OCS-APIRequest': 'true',
          },
        },
        { credential },
      ),
    );

    check(deleteResponse, {
      'user delete': ({ status }) => status === 200,
    });
  }
}

export class UserLatestAPI extends UserLegacyAPI implements UserAPI {
  create(account: Account, credential: Credential, adapter: Adapter) {
    const createResponse = http.request(
      'POST',
      `${this.baseURL}/graph/v1.0/users`,
      JSON.stringify({
        onPremisesSamAccountName: account.login,
        displayName: account.login,
        mail: `${account.login}@owncloud.org`,
        passwordProfile: { password: account.password },
      }),
      buildParams({}, { credential }),
    );

    check(createResponse, {
      'user create': (r) => r.status === 200,
    });

    return this.get(account, adapter);
  }

  delete(id: string, credential: Credential): void {
    const deleteResponse = http.request(
      'DELETE',
      `${this.baseURL}/graph/v1.0/users/${id}`,
      undefined,
      buildParams({}, { credential }),
    );

    check(deleteResponse, {
      'user delete': ({ status }) => status === 204,
    });
  }

  enable(_account: Account, _credential: Credential): void {
    /* not needed in current ocis */
  }
}
