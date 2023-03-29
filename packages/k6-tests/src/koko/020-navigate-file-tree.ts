import { auth, client, utils } from '@ownclouders/k6-tdk';
import exec from 'k6/execution';
import { Options } from 'k6/options';
import { times } from 'lodash-es';


const { Adapter } = auth
const { Client, Version } = client
const { queryJson, k6: { utils: { randomString } } } = utils

interface Credential {
	login: string;
	password: string;
}

interface Info {
	credential: Credential;
	home: string;
	folders: string[][];
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
  folder: {
    rootCount: number;
    childCount: number;
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
  folder: {
    rootCount: parseInt(__ENV.FOLDER_ROOT_COUNT) || 5,
    childCount: parseInt(__ENV.FOLDER_CHILD_COUNT) || 5,
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

    const userFolders = times(settings.folder.rootCount, () => {
      const tree = times(settings.folder.childCount, () => randomString());

      return tree.reduce((acc: string[], name) => {
        acc.push(name);
        userClient.resource.create(userHome, acc.join('/'));

        return acc;
      }, []);
    });

    return {
      home: userHome,
      folders: userFolders,
      credential: userCredential,
    };
  });

  return {
    adminCredential,
    userInfos,
  };
}
export default function ({ userInfos }: Data): void {
  const { home: userHome, folders: userFolders, credential: userCredential } = userInfos[ exec.vu.idInTest - 1 ];
  const userClient = new Client(settings.baseURL, settings.apiVersion, settings.authAdapter, userCredential);

  userFolders.forEach((paths) => {
    for (let i = 1; i <= paths.length; i++) {
      userClient.resource.propfind(userHome, paths.slice(0, i).join('/'));
    }
  });
}
export function teardown({ userInfos, adminCredential }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.apiVersion, settings.authAdapter, adminCredential);

  userInfos.forEach(({ credential }) => adminClient.user.delete(credential.login));
}
