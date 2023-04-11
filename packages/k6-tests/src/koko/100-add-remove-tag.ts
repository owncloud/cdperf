import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Version, versionSupported } from '@ownclouders/k6-tdk/lib/client';
import { queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils';
import { check, Checkers } from 'k6';
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
      credential: userCredential,
      home: userHome,
    };
  });

  return {
    adminCredential,
    userInfos,
  };
}

export default function run({ userInfos, adminCredential }: Data): void {
  const defer: (() => void)[] = [];
  const checks: Checkers<unknown> = {};
  const { home: userHome, credential: userCredential } = userInfos[exec.vu.idInTest - 1];
  const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);
  const tagFolders = times(settings.assets.folderCount, () => {
    return randomString();
  });
  const tagTextDocuments = times(settings.assets.textDocumentCount, () => {
    return [randomString(), '.txt'].join('');
  });
  const getOrCreateTag = (name) => {
    if (settings.clientVersion === Version.ocis) {
      return name;
    }

    const tagListResponse = userClient.tag.list();
    const [{ 'oc:id': id } = { 'oc:id': '' }] = queryXml(`$..[?(@['oc:display-name'] === '${name}')]`, tagListResponse?.body);

    if (id) {
      return id;
    }

    const { headers: { 'Content-Location': contentLocation } } = userClient.tag.create(name) || { headers: { 'Content-Location': '' } };

    return contentLocation.split('/').pop();
  };

  [...tagFolders, ...tagTextDocuments].forEach((resourceName) => {
    const isFile = resourceName.match(/\.[0-9a-z]+$/i);
    const resourceTag = getOrCreateTag(randomString());

    if (isFile) {
      userClient.resource.upload(userHome, resourceName, randomString());
    } else {
      userClient.resource.create(userHome, resourceName);
    }

    defer.push(() => {
      adminClient.tag.delete(resourceTag);
      userClient.resource.delete(userHome, resourceName);
    });

    const propfindResponseInitial = userClient.resource.propfind(userHome, resourceName);
    const [resourceId] = queryXml("$..['oc:fileid']", propfindResponseInitial.body);
    userClient.tag.assign(resourceId, resourceTag);

    const getTags = () => {
      let tags = [];
      if (versionSupported(settings.clientVersion, Version.occ, Version.nc)) {
        tags = queryXml(`$..[?(@['oc:id'] === '${resourceTag}')]['oc:id']`, userClient.tag.get(resourceId)?.body);
      } else {
        tags = queryXml("$..['oc:tags']", userClient.resource.propfind(userHome, resourceName).body);
      }

      return tags[0];
    };

    const resourceTagAfterAssign = getTags();
    checks['test -> tag - assign'] = () => {
      return resourceTagAfterAssign === resourceTag;
    };

    userClient.tag.unassign(resourceId, resourceTag);
    const resourceTagAfterUnassign = getTags();
    checks['test -> tag - unassign'] = () => {
      return resourceTagAfterUnassign === undefined;
    };
  });

  defer.forEach((d) => {
    return d();
  });

  check(undefined, checks);
}

export function teardown({ userInfos, adminCredential }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);

  userInfos.forEach(({ credential }) => {
    return adminClient.user.delete(credential.login);
  });
}
