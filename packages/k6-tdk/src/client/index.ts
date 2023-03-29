import { CookieJar } from 'k6/http';

import { Api } from '@/api';
import { requestFactory } from '@/utils/http';

import { Account, Adapter, Authenficator, BasicAuth, OpenIDConnect } from '../auth';
import { Version } from './client';
import { Resource } from './resource';
import { Share } from './share';
import { User } from './user';


export { Version } from './client';

export class Client {
  user: User;
  share: Share;
  resource: Resource;
  constructor(url: string, version: Version, authAdapter: Adapter, account: Account) {
    let authenficator: Authenficator;
    switch (authAdapter) {
      case Adapter.openIDConnect:
        authenficator = new OpenIDConnect(account, url);
        break;
      case Adapter.basicAuth:
        authenficator = new BasicAuth(account);
        break;
    }

    const request = requestFactory(url, authenficator, {
      jar: new CookieJar(),
    });
    const api = new Api(request);

    this.resource = new Resource(version, api);
    this.user = new User(version, api);
    this.share = new Share(api);
  }
}
