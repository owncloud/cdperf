import { randomBytes as k6_randomBytes } from 'k6/crypto';
import exec from 'k6/execution';
import { Options } from 'k6/options';
import { times } from 'lodash';

import { API, Version } from '../../lib/api';
import { Account, Adapter } from '../../lib/auth';
import { randomString } from '../../lib/utils';

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
  adminUser: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin',
  },
  assets: {
    size: parseInt(__ENV.ASSET_SIZE) || 1024,
    quantity: parseInt(__ENV.ASSET_QUANTITY) || 10,
  },
  k6: {
    vus: 5,
    iterations: 50,
    insecureSkipTLSVerify: true,
  },
};

const api = new API(settings.baseURL, settings.apiVersion);
/**/

export const options: Options = settings.k6;
export function setup(): Data {
  const { user: admin } = api.user.get(
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

  const userInfos = times(options.vus || 1, () => {
    const { user } = api.user.create(
      { login: randomString(), password: randomString() },
      admin.credential,
      settings.authAdapter,
    );

    return {
      ...user,
      home: String(
        api.me.driveInfo(user.login, user.credential, {
          selector: 'value.#(driveType=="personal").id',
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
  const { user } = api.user.get(userInfo, settings.authAdapter);
  const data = k6_randomBytes(settings.assets.size * 1024);
  times(settings.assets.quantity, (i) => {
    api.dav.upload(userInfo.home, [exec.scenario.iterationInTest, userInfo.login, i].join('-'), data, user.credential);
  });
}

export function teardown({ adminInfo, userInfos }: Data): void {
  const { user: admin } = api.user.get(adminInfo, settings.authAdapter);
  userInfos.forEach((info) => api.user.delete(info.login, admin.credential));
}
