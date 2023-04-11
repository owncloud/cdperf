import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Version } from '@ownclouders/k6-tdk/lib/client';
import {
  queryJson, queryXml, Queue, randomString,
} from '@ownclouders/k6-tdk/lib/utils';
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
  assets: {
    folderCount: number;
    textDocumentCount: number;
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
  assets: {
    folderCount: parseInt(__ENV.ASSETS_FOLDER_COUNT, 10) || 2,
    textDocumentCount: parseInt(__ENV.ASSETS_TEXT_DOCUMENT_COUNT, 10) || 2,
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

    return {
      home: userHome,
      credential: userCredential,
    };
  });

  return {
    adminCredential,
    userInfos,
  };
}

export default function run({ userInfos }: Data): void {
  const defer: (() => void)[] = [];
  const { home: userHome, credential: userCredential } = userInfos[exec.vu.idInTest - 1];
  const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);
  const searchTasks = new Queue({ delay: 1000, delayMultiplier: 0 });
  const folderNames = times(settings.assets.folderCount, () => {
    return randomString();
  });
  const textDocuments = times(settings.assets.textDocumentCount, () => {
    return [`${randomString()}.txt`, randomString()];
  });

  const searchTask = (query: string, expectedId: string, description: string) => {
    const searchResponse = userClient.search.resource(userCredential.login, { query });
    const [searchFileID] = queryXml("$..['oc:fileid']", searchResponse?.body);
    const ready = !!searchFileID;

    if (!ready) {
      return Promise.reject();
    }

    check(undefined, {
      [`test -> search.${description} - found`]: () => {
        return expectedId === searchFileID;
      },
    });

    return Promise.resolve();
  };

  folderNames.forEach((folderName) => {
    userClient.resource.create(userHome, folderName);
    const propfindResponse = userClient.resource.propfind(userHome, folderName);
    const [expectedId] = queryXml("$..['oc:fileid']", propfindResponse?.body);

    searchTasks.add(() => {
      return searchTask(folderName, expectedId, 'folder-name');
    });

    defer.push(() => {
      userClient.resource.delete(userHome, folderName);
    });
  });

  textDocuments.forEach(([documentName, documentContent]) => {
    userClient.resource.upload(userHome, documentName, documentContent);
    const propfindResponse = userClient.resource.propfind(userHome, documentName);
    const [expectedId] = queryXml("$..['oc:fileid']", propfindResponse?.body);

    searchTasks.add(() => {
      return searchTask(documentName, expectedId, 'file-name');
    });
    // idea for later:
    // content search only works if ocis has content extraction enabled (SEARCH_EXTRACTOR_TYPE=tika),
    // needs further testing, therefore deactivated for the moment.
    // searchTasks.add(() => searchTask(documentContent, expectedId, 'file-content'))

    defer.push(() => {
      userClient.resource.delete(userHome, documentName);
    });
  });

  searchTasks.exec().then(() => {
    return defer.forEach((d) => {
      return d();
    });
  });
}

export function teardown({ userInfos, adminCredential }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);

  userInfos.forEach(({ credential }) => {
    return adminClient.user.delete(credential.login);
  });
}
