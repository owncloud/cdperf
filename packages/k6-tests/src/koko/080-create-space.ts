import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Version, versionGuard } from '@ownclouders/k6-tdk/lib/client';
import { queryJson, randomString } from '@ownclouders/k6-tdk/lib/utils';
import exec from 'k6/execution';
import { Options } from 'k6/options';
import { times } from 'lodash';

interface Credential {
  login: string;
  password: string;
}

interface Info {
  credential: Credential;
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
  spaceCount: number;
  k6: Options;
}

/**/
const settings: Settings = {
  baseURL: __ENV.BASE_URL || 'https://localhost:9200',
  authAdapter: __ENV.AUTH_ADAPTER == Adapter.basicAuth ? Adapter.basicAuth : Adapter.openIDConnect,
  clientVersion: Version[ __ENV.CLIENT_VERSION ] || Version.ocis,
  adminUser: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin'
  },
  spaceCount: parseInt(__ENV.SPACE_COUNT) || 2,
  k6: {
    vus: 1,
    insecureSkipTLSVerify: true
  }
};

// protect test against incompatible client versions
versionGuard(settings.clientVersion, Version.ocis)

/**/
export const options: Options = settings.k6;

export function setup(): Data {
  const adminCredential = settings.adminUser;
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);
  const roleListResponse = adminClient.role.list()
  const [appRoleId] = queryJson('$.bundles[?(@.name === \'spaceadmin\')].id', roleListResponse?.body);
  const applicationListResponse = adminClient.application.list()
  const [resourceId] = queryJson('$.value[?(@.displayName === \'ownCloud Infinite Scale\')].id', applicationListResponse?.body);

  const userInfos = times<Info>(options.vus || 1, () => {
    const userCredential = { login: randomString(), password: randomString() };
    const userCreateResponse = adminClient.user.create(userCredential);
    const [principalId] = queryJson('$.id', userCreateResponse.body);

    adminClient.user.assignRole(principalId, appRoleId, resourceId)

    return {
      credential: userCredential
    };
  });

  return {
    adminCredential,
    userInfos
  };
}

export default function ({ userInfos }: Data): void {
  const defer: (() => void)[] = [];
  const { credential: userCredential } = userInfos[ exec.vu.idInTest - 1 ];
  const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);
  const spaceNames = times(settings.spaceCount, () => {
    return randomString()
  })

  spaceNames.forEach((spaceName) => {
    const driveCreateResponse = userClient.drive.create(spaceName)
    const [spaceId] = queryJson('$.id', driveCreateResponse?.body);

    defer.push(() => {
      userClient.drive.delete(spaceId)
    });
  })

  defer.forEach((c) => {
    return c()
  });
}

export function teardown({ userInfos, adminCredential }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);

  userInfos.forEach(({ credential }) => {
    return adminClient.user.delete(credential.login)
  });
}
