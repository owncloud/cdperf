import { randomBytes as k6_randomBytes } from 'k6/crypto';
import exec from 'k6/execution';
import { Options } from 'k6/options';
import { times } from 'lodash';

import { randomString } from '../../../lib/utils';
import { API, Version } from './lib/api';
import { Account, Adapter } from './lib/auth';

interface UserInfo {
  home: string;
  login: string;
  password: string;
}
interface Data {
  adminInfo: UserInfo;
  userInfos: UserInfo[];
}

interface Settings {
  authAdapter: Adapter;
  baseURL: string;
  apiVersion: Version;
  adminUser: Account;
  testFolder: string;
  assets: {
    quantity: number;
    size: number;
  };
  k6: Options;
}

/**/
const settings: Settings = {
  baseURL: __ENV.BASE_URL || 'https://localhost:9200',
  authAdapter: __ENV.AUTH_ADAPTER == Adapter.basicAuth ? Adapter.basicAuth : Adapter.openIDConnect,
  apiVersion: __ENV.API_VERSION == Version.legacy ? Version.legacy : Version.latest,
  testFolder: 'test-folder',
  adminUser: {
    login: 'admin',
    password: 'admin',
  },
  assets: {
    size: 1,
    quantity: 10,
  },
  k6: {
    vus: 5,
    iterations: 50,
    insecureSkipTLSVerify: true,
  },
};

const api = new API(settings.baseURL, settings.apiVersion);
/**/

export const options: Options = {
  vus: 5,
  iterations: 50,
  insecureSkipTLSVerify: true,
};

export function setup(): Data {
  const admin = api.user.get(
    { login: settings.adminUser.login, password: settings.adminUser.password },
    settings.authAdapter,
  );
  const adminInfo: UserInfo = {
    ...admin,
    home: String(
      api.me.driveInfo(admin.login, admin.credential, {
        selector: 'value.#(driveType=="personal").id',
      }),
    ),
  };
  api.dav.create(adminInfo.home, settings.testFolder, admin.credential);

  const userInfos = times(options.vus || 1, () => {
    const user = api.user.create(
      { login: randomString(), password: randomString() },
      admin.credential,
      settings.authAdapter,
    );
    const share = api.share.create(settings.testFolder, admin.credential, user.login);
    api.share.accept(share.id, user.credential);

    return {
      ...user,
      home: String(
        api.me.driveInfo([user.login, settings.testFolder].join('/'), user.credential, {
          selector: `value.#(driveAlias=="mountpoint/${settings.testFolder}").id`,
        }),
      ),
    };
  });

  return {
    adminInfo,
    userInfos,
  };
}

export default function ({ userInfos }: Data): void {
  const userInfo = userInfos[exec.vu.idInTest - 1];
  const user = api.user.get(userInfo, settings.authAdapter);
  const folderNameInitial = [exec.scenario.iterationInTest, 'initial', user.login].join('-');
  api.dav.create(userInfo.home, folderNameInitial, user.credential);

  const data = k6_randomBytes(settings.assets.size * 1024);
  times(settings.assets.quantity, (i) => {
    api.dav.upload(userInfo.home, [folderNameInitial, i].join('/'), data, user.credential);
  });

  const folderNameFinal = [exec.scenario.iterationInTest, 'final', user.login].join('-');
  api.dav.move(userInfo.home, folderNameInitial, folderNameFinal, user.credential);
}

export function teardown({ adminInfo, userInfos }: Data): void {
  const admin = api.user.get(adminInfo, settings.authAdapter);
  api.dav.delete(adminInfo.home, settings.testFolder, admin.credential);
  userInfos.forEach((info) => api.user.delete(info.login, admin.credential));
}
