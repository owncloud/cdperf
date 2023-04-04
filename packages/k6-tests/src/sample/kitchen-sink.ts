import { Permission, ShareType } from '@ownclouders/k6-tdk/lib/api';
import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Version } from '@ownclouders/k6-tdk/lib/client';
import { queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils';
import { fail } from 'k6';
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
  k6: Options;
}

/**/
const settings: Settings = {
  baseURL: __ENV.BASE_URL || 'https://localhost:9200',
  authAdapter: __ENV.AUTH_ADAPTER == Adapter.basicAuth ? Adapter.basicAuth : Adapter.openIDConnect,
  clientVersion: Version[ __ENV.CLIENT_VERSION ] || Version.ocis,
  adminUser: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin',
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
    const [userHome = userCredential.login] = queryJson('$.value[?(@.driveType === \'personal\')].id', userDrivesResponse?.json());

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

export default function ({ userInfos, adminCredential }: Data): void {
  const defer: (() => void)[] = [];
  const { home: userHome, credential: userCredential } = userInfos[ exec.vu.idInTest - 1 ];
  const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);

  const userMeResponse = userClient.user.me();
  const [userDisplayName = userCredential.login] = queryJson('displayNamed', userMeResponse?.json());
  if (userDisplayName !== userCredential.login) {
    fail('userDisplayName does not match');
  }

  const folderCreationName = randomString();
  const folderMovedName = randomString();
  const assetName = randomString();
  userClient.resource.create(userHome, folderCreationName);
  defer.push(() => userClient.resource.delete(userHome, folderMovedName));
  userClient.resource.move(userHome, folderCreationName, folderMovedName);
  userClient.resource.upload(userHome, [folderMovedName, assetName].join('/'), randomBytes(1000));
  userClient.resource.download(userHome, [folderMovedName, assetName].join('/'));

  const createdShareResponse = userClient.share.create(
    folderMovedName,
    adminCredential.login,
    ShareType.user,
    Permission.all,
  );
  const [createdShareId] = queryXml('ocs.data.id', createdShareResponse.body);
  if (!createdShareId) {
    fail('createdShareId is empty');
  }

  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);
  adminClient.share.accept(createdShareId);

  defer.forEach((d) => d());
}

export function teardown({ userInfos, adminCredential }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);

  userInfos.forEach(({ credential }) => adminClient.user.delete(credential.login));
}
