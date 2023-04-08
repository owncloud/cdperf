import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Version } from '@ownclouders/k6-tdk/lib/client';
import { Permission, ShareType } from  '@ownclouders/k6-tdk/lib/endpoints';
import { queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils';
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
	adminInfo: Info;
	userInfos: Info[];
}

interface Settings {
  authAdapter: Adapter;
  baseURL: string;
  clientVersion: Version;
  adminUser: Credential;
  testFolder: string;
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
  clientVersion: Version[ __ENV.CLIENT_VERSION ] || Version.ocis,
  adminUser: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin',
  },
  testFolder: __ENV.TEST_FOLDER || 'oc-share-upload-rename',
  assets: {
    size: parseInt(__ENV.ASSET_SIZE) || 1000,
    quantity: parseInt(__ENV.ASSET_QUANTITY) || 10,
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
  const adminDrivesResponse = adminClient.user.drives();
  const [ adminHome = adminCredential.login ] = queryJson('$.value[?(@.driveType === \'personal\')].id', adminDrivesResponse?.body);

  adminClient.resource.create(adminHome, settings.testFolder);

  const userInfos = times<Info>(options.vus || 1, () => {
    const userCredential = { login: randomString(), password: randomString() };
    adminClient.user.create(userCredential);
    adminClient.user.enable(userCredential.login);

    const createdShareResponse = adminClient.share.create(settings.testFolder,
      userCredential.login,
      ShareType.user,
      Permission.all,);
    const [ createdShareId ] = queryXml('ocs.data.id', createdShareResponse.body);

    const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);
    const userDrivesResponse = userClient.user.drives();
    const [ userHome = userCredential.login ] = queryJson('$.value[?(@.driveType === \'personal\')].id', userDrivesResponse?.body);
    userClient.share.accept(createdShareId);

    return {
      credential: userCredential,
      home: userHome,
    };
  });

  return {
    adminInfo: {
      credential: adminCredential,
      home: adminHome,
    },
    userInfos,
  };
}

export default function ({ userInfos }: Data): void {
  const { home: userHome, credential: userCredential } = userInfos[ exec.vu.idInTest - 1 ];
  const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);

  const folderCreationName = [ exec.scenario.iterationInTest, 'initial', userCredential.login ].join('-');
  userClient.resource.create(userHome, folderCreationName);

  const data = randomBytes(settings.assets.size * 1000);
  times(settings.assets.quantity, (i) => {
    userClient.resource.upload(userHome, [ folderCreationName, i ].join('/'), data);
  });

  const folderMovedName = [ exec.scenario.iterationInTest, 'final', userCredential.login ].join('-');
  userClient.resource.move(userHome, folderCreationName, folderMovedName);
}

export function teardown({ userInfos, adminInfo }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminInfo.credential);
  adminClient.resource.delete(adminInfo.home, settings.testFolder);
  userInfos.forEach(({ credential }) => {
    return adminClient.user.delete(credential.login)
  });
}
