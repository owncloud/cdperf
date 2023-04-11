import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Version } from '@ownclouders/k6-tdk/lib/client';
import { queryJson, randomString } from '@ownclouders/k6-tdk/lib/utils';
import { randomBytes } from 'k6/crypto';
import exec from 'k6/execution';
import { Options } from 'k6/options';
import { times } from 'lodash';

interface Credential {
  login: string;
  password: string;
}

interface Info {
  credential: Credential;
  home: string;
}

interface Data {
  adminCredential: Credential;
  userInfos: Info[];
}

interface Settings {
  authAdapter: Adapter;
  baseURL: string;
  clientVersion: Version;
  adminUser: Credential;
  assets: {
    quantity: number;
    size: number;
  };
  k6: Options;
}

/**/
const settings: Settings = {
  baseURL: __ENV.BASE_URL || 'https://localhost:9200',
  authAdapter: __ENV.AUTH_ADAPTER === Adapter.basicAuth ? Adapter.basicAuth : Adapter.openIDConnect,
  clientVersion: Version[__ENV.CLIENT_VERSION] || Version.ocis,
  adminUser: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin',
  },
  assets: {
    size: parseInt(__ENV.ASSET_SIZE, 10) || 1000,
    quantity: parseInt(__ENV.ASSET_QUANTITY, 10) || 10,
  },
  k6: {
    vus: 1,
    insecureSkipTLSVerify: true,
  },
};

/**/
export const options: Options = settings.k6;

export function setup(): Data {
  const adminCredential = settings.adminUser;
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);

  const userInfos = times<Info>(options.vus || 1, () => {
    const userCredential = { login: randomString(), password: randomString() };
    adminClient.user.create(userCredential);
    adminClient.user.enable(userCredential.login);

    const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);
    const userDrivesResponse = userClient.user.drives();
    const [userHome = userCredential.login] = queryJson("$.value[?(@.driveType === 'personal')].id", userDrivesResponse?.body);

    return {
      credential: userCredential,
      home: userHome,
    };
  });

  return {
    adminCredential,
    userInfos,
  };
}

export default function run({ userInfos }: Data): void {
  const { home: userHome, credential: userCredential } = userInfos[exec.vu.idInTest - 1];
  const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);
  const data = randomBytes(settings.assets.size * 1000);
  times(settings.assets.quantity, (i) => {
    userClient.resource.upload(userHome, [exec.scenario.iterationInTest, userCredential.login, i].join('-'), data);
  });
}

export function teardown({ userInfos, adminCredential }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);

  userInfos.forEach(({ credential }) => {
    return adminClient.user.delete(credential.login);
  });
}
