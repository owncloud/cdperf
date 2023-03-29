import { api,auth, client, utils } from '@ownclouders/k6-tdk';
import { fail } from 'k6';
import { randomBytes } from 'k6/crypto';
import exec from 'k6/execution';
import { Options } from 'k6/options';
import { times } from 'lodash-es';


const { Permission, ShareType } = api
const { Adapter } = auth
const { Client, Version } = client
const { queryJson, queryXml, k6: { utils: { randomString } } } = utils

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
  authAdapter: auth.Adapter;
  baseURL: string;
  apiVersion: client.Version;
  adminUser: Credential;
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
    const userCredential = { login: randomString(), password: randomString() };
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

export default function ({ userInfos, adminCredential }: Data): void {
  const defer: (() => void)[] = [];
  const { home: userHome, credential: userCredential } = userInfos[ exec.vu.idInTest - 1 ];
  const userClient = new Client(settings.baseURL, settings.apiVersion, settings.authAdapter, userCredential);

  const userMeResponse = userClient.user.me();
  const [ userDisplayName ] = queryJson('displayNamed', userMeResponse?.json(), [ userCredential.login ]);
  if (userDisplayName !== userCredential.login) {
    fail('userDisplayName does not match');
  }

  const folderCreationName = randomString();
  const folderMovedName = randomString();
  const assetName = randomString();
  userClient.resource.create(userHome, folderCreationName);
  defer.push(() => userClient.resource.delete(userHome, folderMovedName));
  userClient.resource.move(userHome, folderCreationName, folderMovedName);
  userClient.resource.upload(userHome, [ folderMovedName, assetName ].join('/'), randomBytes(1000));
  userClient.resource.download(userHome, [ folderMovedName, assetName ].join('/'));

  const createdShareResponse = userClient.share.create(
    folderMovedName,
    adminCredential.login,
    ShareType.user,
    Permission.all,
  );
  const [ createdShareId ] = queryXml('ocs.data.id', createdShareResponse.body);
  if (!createdShareId) {
    fail('createdShareId is empty');
  }

  const adminClient = new Client(settings.baseURL, settings.apiVersion, settings.authAdapter, adminCredential);
  adminClient.share.accept(createdShareId);

  defer.forEach((d) => d());
}

export function teardown({ userInfos, adminCredential }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.apiVersion, settings.authAdapter, adminCredential);

  userInfos.forEach(({ credential }) => adminClient.user.delete(credential.login));
}
