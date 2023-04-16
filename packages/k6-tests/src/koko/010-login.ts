import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Platform } from '@ownclouders/k6-tdk/lib/client';
import { check, platformGuard, queryJson, randomString } from '@ownclouders/k6-tdk/lib/utils';
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

    return {
      actorLogin,
      actorPassword
    };
  });

  return {
    adminData: {
      adminLogin: settings.admin.login,
      adminPassword: settings.admin.password
    },
    actorData
  };
}

export default function actor({ actorData }: Environment): void {
  const { actorLogin, actorPassword } = actorData[exec.vu.idInTest - 1];
  const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword });
  const getMyProfileResponse = actorClient.me.getMyProfile();
  const guards = { ...platformGuard(settings.platform) }

  check({ skip: guards.isOwnCloudServer || guards.isNextcloud, val: getMyProfileResponse }, {
    'user displayName': (r) => {
      const [displayName] = queryJson('displayName', r?.body)
      return displayName === actorLogin;
    }
  });

}

export function teardown({ adminData, actorData }: Environment): void {
  const adminClient = new Client({ ...settings, userLogin: adminData.adminLogin, userPassword: adminData.adminPassword });

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin });
  });
}
