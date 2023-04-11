import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Version } from '@ownclouders/k6-tdk/lib/client';
import { Permission, ShareType } from '@ownclouders/k6-tdk/lib/endpoints';
import { queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils';
import { check } from 'k6';
import exec from 'k6/execution';
import { Options } from 'k6/options';
import { times } from 'lodash';

interface Credential {
  login: string;
  password: string;
}

interface Info {
  credential: Credential;
  shareFolder: string;
}

interface Data {
  adminCredential: Credential;
  userInfos: Info[];
  shareReceiverUserInfos: Credential[];
}

interface Settings {
  authAdapter: Adapter;
  baseURL: string;
  clientVersion: Version;
  adminUser: Credential;
  shareReceivers: {
    userCount: number;
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
  shareReceivers: {
    userCount: parseInt(__ENV.SHARE_RECEIVERS_USER_COUNT, 10) || 35,
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

    const userShareFolder = randomString();
    userClient.resource.create(userHome, userShareFolder);

    return {
      credential: userCredential,
      shareFolder: userShareFolder,
    };
  });

  const shareReceiverUserInfos = times<Credential>(settings.shareReceivers.userCount, () => {
    const shareeCredential = { login: randomString(), password: randomString() };
    adminClient.user.create(shareeCredential);
    adminClient.user.enable(shareeCredential.login);

    return shareeCredential;
  });

  return {
    adminCredential,
    userInfos,
    shareReceiverUserInfos,
  };
}

export default function run({ userInfos, shareReceiverUserInfos }: Data): void {
  const defer: (() => void)[] = [];
  const { credential: userCredential, shareFolder: userShareFolder } = userInfos[exec.vu.idInTest - 1];
  const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);
  shareReceiverUserInfos.forEach(({ login }) => {
    const createShareResponse = userClient.share.create(userShareFolder, login, ShareType.user, Permission.all);
    const [foundShareRecipient] = queryXml('ocs.data.share_with', createShareResponse.body);

    check(undefined, {
      'test -> share received - match': () => {
        return foundShareRecipient === login;
      },
    });

    defer.push(() => {
      const [shareId] = queryXml('ocs.data.id', createShareResponse.body);
      userClient.share.delete(shareId);
    });
  });

  defer.forEach((d) => {
    return d();
  });
}

export function teardown({ userInfos, adminCredential, shareReceiverUserInfos }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);

  userInfos.forEach(({ credential }) => {
    return adminClient.user.delete(credential.login);
  });

  shareReceiverUserInfos.forEach(({ login }) => {
    return adminClient.user.delete(login);
  });
}
