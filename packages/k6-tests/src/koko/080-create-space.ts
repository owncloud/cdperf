import { Platform } from '@ownclouders/k6-tdk';
import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client } from '@ownclouders/k6-tdk/lib/client';
import { queryJson, randomString } from '@ownclouders/k6-tdk/lib/utils';
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
  authAdapter: __ENV.AUTH_ADAPTER === Adapter.basicAuth ? Adapter.basicAuth : Adapter.kopano,
  platform: Platform[__ENV.PLATFORM] || Platform.ownCloudInfiniteScale,
  admin: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin'
  },
  spaceCount: parseInt(__ENV.SPACE_COUNT, 10) || 2,
  k6: {
    vus: 1,
    insecureSkipTLSVerify: true
  }
};

/**/
export const options: Options = settings.k6;

export function setup(): Environment {
  const adminClient = new Client({ ...settings, userLogin: settings.admin.login, userPassword: settings.admin.password });
  const getRolesResponse = adminClient.role.getRoles()
  const [appRoleId] = queryJson("$.bundles[?(@.name === 'spaceadmin')].id", getRolesResponse?.body);
  const listApplicationsResponse = adminClient.application.listApplications();
  const [resourceId] = queryJson("$.value[?(@.displayName === 'ownCloud Infinite Scale')].id", listApplicationsResponse?.body);

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    const createUserResponse = adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword });
    const [principalId] = queryJson('$.id', createUserResponse.body)

    adminClient.role.addRoleToUser({ appRoleId, resourceId, principalId });

    return {
      actorLogin,
      actorPassword
    }
  });

  return {
    adminData: {
      adminLogin: settings.admin.login,
      adminPassword: settings.admin.password
    },
    actorData
  }
}

export default function actor({ actorData }: Environment): void {
  const { actorLogin, actorPassword } = actorData[exec.vu.idInTest - 1];
  const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword });
  const defer: (() => void)[] = [];
  const spaceNames = times(settings.spaceCount, () => {
    return randomString();
  });

  spaceNames.forEach((driveName) => {
    const driveCreateResponse = actorClient.drive.createDrive({ driveName });
    const [driveId] = queryJson('$.id', driveCreateResponse?.body);

    defer.push(() => {
      actorClient.drive.deleteDrive({ driveId })
    });
  });

  defer.forEach((d) => {
    d();
  });
}

export function teardown({ adminData, actorData }: Environment): void {
  const adminClient = new Client({ ...settings, userLogin: adminData.adminLogin, userPassword: adminData.adminPassword });

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin });
  });
}
