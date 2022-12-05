import { DavAPI, DavLatestAPI, DavLegacyAPI } from './dav';
import { MeAPI, MeLatestAPI, MeLegacyAPI } from './me';
import { ShareAPI } from './share';
import { UserAPI, UserLatestAPI, UserLegacyAPI } from './user';

export { User } from './user';

export const Version = {
  latest: 'latest',
  legacy: 'legacy',
} as const;

export type Version = typeof Version[keyof typeof Version];

export class API {
  dav: DavAPI;
  share: ShareAPI;
  user: UserAPI;

  me: MeAPI;

  constructor(baseURL: string, version: Version) {
    this.share = new ShareAPI(baseURL);

    switch (version) {
      case Version.latest:
        this.dav = new DavLatestAPI(baseURL);
        this.user = new UserLatestAPI(baseURL);
        this.me = new MeLatestAPI(baseURL);
        break;
      case Version.legacy:
        this.dav = new DavLegacyAPI(baseURL);
        this.user = new UserLegacyAPI(baseURL);
        this.me = new MeLegacyAPI(baseURL);
        break;
    }
  }
}
