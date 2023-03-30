import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Version } from '@ownclouders/k6-tdk/lib/client';
import { k6, queryJson } from '@ownclouders/k6-tdk/lib/utils';
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
  apiVersion: Version;
  adminUser: Credential;
  assets: {
    small: {
      quantity: number;
      size: number;
    };
    medium: {
      quantity: number;
      size: number;
    };
    large: {
      quantity: number;
      size: number;
    };
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
    small: {
      size: parseInt(__ENV.ASSET_SMALL_SIZE) || 10,
      quantity: parseInt(__ENV.ASSET_SMALL_QUANTITY) || 1,
    },
    medium: {
      size: parseInt(__ENV.ASSET_MEDIUM_SIZE) || 10 * 20,
      quantity: parseInt(__ENV.ASSET_MEDIUM_QUANTITY) || 1,
    },
    large: {
      size: parseInt(__ENV.ASSET_SIZE) || 10 * 100,
      quantity: parseInt(__ENV.ASSET_LARGE_QUANTITY) || 1,
    },
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
  const adminClient = new Client(settings.baseURL, settings.apiVersion, settings.authAdapter, adminCredential);

  const userInfos = times<Info>(options.vus || 1, () => {
    const userCredential = { login: k6.utils.randomString(), password: k6.utils.randomString() };
    adminClient.user.create(userCredential);
    adminClient.user.enable(userCredential.login);

    const userClient = new Client(settings.baseURL, settings.apiVersion, settings.authAdapter, userCredential);
    const userDrivesResponse = userClient.user.drives();
    const [ userHome ] = queryJson('$.value[?(@.driveType === \'personal\')].id', userDrivesResponse?.json(), [
      userCredential.login,
    ]);

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

export default function ({ userInfos }: Data): void {
  const defer: (() => void)[] = [];
  const { home: userHome, credential: userCredential } = userInfos[ exec.vu.idInTest - 1 ];
  const userClient = new Client(settings.baseURL, settings.apiVersion, settings.authAdapter, userCredential);

  for (const [ k, v ] of Object.entries(settings.assets)) {
    times(v.quantity, (i) => {
      const assetName = [ exec.scenario.iterationInTest, k, i ].join('-');

      userClient.resource.upload(userHome, assetName, randomBytes(v.size * 1000));
      defer.push(() => userClient.resource.delete(userHome, assetName));
    });
  }

  defer.forEach((c) => c());
}

export function teardown({ userInfos, adminCredential }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.apiVersion, settings.authAdapter, adminCredential);

  userInfos.forEach(({ credential }) => adminClient.user.delete(credential.login));
}
