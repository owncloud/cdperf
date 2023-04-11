import { CookieJar } from 'k6/http';

import {
  Account, Adapter, Authenticator, BasicAuth, OpenIDConnect,
} from '@/auth';
import { requestFactory } from '@/utils/http';

import { Application } from './application';
import { Version } from './client';
import { Drive } from './drive';
import { Group } from './group';
import { Resource } from './resource';
import { Role } from './role';
import { Search } from './search';
import { Share } from './share';
import { Tag } from './tag';
import { User } from './user';

export * from './client';

export class Client {
  application: Application;

  drive: Drive;

  group: Group;

  resource: Resource;

  role: Role;

  search: Search;

  share: Share;

  tag: Tag;

  user: User;

  constructor(url: string, version: Version, authAdapter: Adapter, account: Account) {
    let authenticator: Authenticator;
    switch (authAdapter) {
      case Adapter.basicAuth:
        authenticator = new BasicAuth(account);
        break;
      case Adapter.openIDConnect:
      default:
        authenticator = new OpenIDConnect(account, url);
        break;
    }

    const request = requestFactory(url, authenticator, {
      jar: new CookieJar(),
    });

    this.application = new Application(version, request);
    this.drive = new Drive(version, request);
    this.group = new Group(version, request);
    this.resource = new Resource(version, request);
    this.role = new Role(version, request);
    this.search = new Search(version, request);
    this.share = new Share(request);
    this.tag = new Tag(version, request);
    this.user = new User(version, request);
  }
}
