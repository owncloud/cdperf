import { CookieJar } from 'k6/http';
import { Endpoints } from 'src/endpoints';

import { Account, Adapter, Authenticator, BasicAuth, OpenIDConnect } from '@/auth';
import { requestFactory } from '@/utils/http';

import { Application } from './application';
import { Version } from './client';
import { Drive } from './drive';
import { Group } from './group';
import { Resource } from './resource';
import { Role } from './role';
import { Search } from './search';
import { Share } from './share';
import { User } from './user';

export { Version } from './client';

export const versionGuard = (currentVersion: Version, ...allowedVersions: Version[]) => {
  if(allowedVersions.includes(currentVersion)) {
    return
  }

  throw new Error(`you are using the client version [${currentVersion}] which is not compatible with the test, the following versions are compatible: [${allowedVersions.join(', ')}]`)
}

export class Client {
  application: Application;

  drive: Drive;

  group: Group;

  resource: Resource;

  role: Role;

  search: Search;

  share: Share;

  user: User;

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
    const endpoints = new Endpoints(request);

    this.application = new Application(version, endpoints);
    this.drive = new Drive(version, endpoints);
    this.group = new Group(version, endpoints);
    this.resource = new Resource(version, endpoints);
    this.role = new Role(version, endpoints);
    this.search = new Search(version, endpoints);
    this.share = new Share(endpoints);
    this.user = new User(version, endpoints);
  }
}
