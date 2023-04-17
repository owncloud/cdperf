import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Platform } from '@ownclouders/k6-tdk/lib/client';
import { queryJson, randomString } from '@ownclouders/k6-tdk/lib/utils';
import { randomBytes } from 'k6/crypto';
import exec from 'k6/execution';
import { Options } from 'k6/options';
import { times } from 'lodash';

interface Environment {
  adminData: {
    adminLogin: string;
    adminPassword: string;
  };
  actorData: {
    actorLogin: string;
    actorPassword: string;
    actorRoot: string;
  }[];
}

/**/
const settings = {
  baseUrl: __ENV.BASE_URL || 'https://localhost:9200',
  authAdapter: __ENV.AUTH_ADAPTER === Adapter.basicAuth ? Adapter.basicAuth : Adapter.openIDConnect,
  platform: Platform[__ENV.PLATFORM] || Platform.ownCloudInfiniteScale,
  admin: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin'
  },
  assets: {
    small: {
      size: parseInt(__ENV.ASSET_SMALL_SIZE, 10) || 10,
      quantity: parseInt(__ENV.ASSET_SMALL_QUANTITY, 10) || 1
    },
    medium: {
      size: parseInt(__ENV.ASSET_MEDIUM_SIZE, 10) || 10 * 10,
      quantity: parseInt(__ENV.ASSET_MEDIUM_QUANTITY, 10) || 1
    },
    large: {
      size: parseInt(__ENV.ASSET_LARGE_SIZE, 10) || 10 * 100,
      quantity: parseInt(__ENV.ASSET_LARGE_QUANTITY, 10) || 1
    }
  },
  k6: {
    vus: 1,
    insecureSkipTLSVerify: true
  }
};

/**/
export const options: Options = settings.k6;

export function setup(): Environment {
  const adminClient = new Client({ ...settings, userLogin: settings.admin.login, userPassword: settings.admin.password });

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword });
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword });
    const getMyDrivesResponse = actorClient.me.getMyDrives();
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body);

    return {
      actorLogin,
      actorPassword,
      actorRoot
    }
  })

  return {
    adminData: {
      adminLogin: settings.admin.login,
      adminPassword: settings.admin.password
    },
    actorData
  }
}

export default function actor({ actorData }: Environment): void {
  const { actorLogin, actorPassword, actorRoot } = actorData[exec.vu.idInTest - 1];
  const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword });
  const defer: (() => void)[] = [];

  Object.keys(settings.assets).forEach((k) => {
    const { quantity, size } = settings.assets[k];
    times(quantity, (i) => {
      const assetName = [exec.scenario.iterationInTest, k, i].join('-');

      actorClient.resource.uploadResource({ root: actorRoot, resourcePath: assetName, resourceBytes: randomBytes(size * 1000) });
      defer.push(() => {
        actorClient.resource.deleteResource({ root: actorRoot, resourcePath: assetName });
      });
    });
  });

  defer.forEach((c) => {
    c();
  });
}

export function teardown({ adminData, actorData }: Environment): void {
  const adminClient = new Client({ ...settings, userLogin: adminData.adminLogin, userPassword: adminData.adminPassword });

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin });
  });
}
