import { CookieJar } from 'k6/http';

import { Api } from '@/api';
import { Account, Adapter, Authenticator, BasicAuth, OpenIDConnect } from '@/auth';
import { requestFactory } from '@/utils/http';

import { Version } from './client';
import { Resource } from './resource';
import { Search } from './search';
import { Share } from './share';
import { User } from './user';

export { Version } from './client';

export class Client {
  user: User;
  share: Share;
  resource: Resource;
  search: Search;

  constructor(url: string, version: Version, authAdapter: Adapter, account: Account) {
    let authenticator: Authenticator;
    switch (authAdapter) {
      case Adapter.openIDConnect:
        authenticator = new OpenIDConnect(account, url);
        break;
      case Adapter.basicAuth:
        authenticator = new BasicAuth(account);
        break;
    }

    const request = requestFactory(url, authenticator, {
      jar: new CookieJar(),
    });
    const api = new Api(request);

    this.resource = new Resource(version, api);
    this.user = new User(version, api);
    this.share = new Share(api);
    this.search = new Search(version, api);
  }
}
