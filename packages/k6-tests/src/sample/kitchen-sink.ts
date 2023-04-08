import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Version } from '@ownclouders/k6-tdk/lib/client';
import { ItemType, Permission, ShareType } from '@ownclouders/k6-tdk/lib/endpoints';
import { backOff, queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils';
import { check, fail } from 'k6';
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
    password: __ENV.ADMIN_PASSWORD || 'admin'
  },
  k6: {
    vus: 1,
    insecureSkipTLSVerify: true
  }
};

/**/
export const options: Options = settings.k6;

export function setup(): Data {
  const adminCredential = settings.adminUser;
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);
  const roleListResponse = adminClient.role.list()
  const [appRoleId] = queryJson('$.bundles[?(@.name === \'spaceadmin\')].id', roleListResponse?.body);
  const applicationListResponse = adminClient.application.list()
  const [resourceId] = queryJson('$.value[?(@.displayName === \'ownCloud Infinite Scale\')].id', applicationListResponse?.body);

  const groupName = randomString()
  const groupCreateResponse = adminClient.group.create(groupName)
  const [groupId = groupName] = queryJson('$.id', groupCreateResponse?.body);
  adminClient.group.delete(groupId)

  const userInfos = times<Info>(options.vus || 1, () => {
    const userCredential = { login: randomString(), password: randomString() };
    const userCreateResponse = adminClient.user.create(userCredential);
    const [principalId] = queryJson('$.id', userCreateResponse.body);

    adminClient.user.enable(userCredential.login);
    adminClient.user.assignRole(principalId, appRoleId, resourceId)

    const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);
    const userDrivesResponse = userClient.user.drives();
    const [userHome = userCredential.login] = queryJson('$.value[?(@.driveType === \'personal\')].id', userDrivesResponse?.body);

    return {
      credential: userCredential,
      home: userHome
    };
  });

  return {
    adminCredential,
    userInfos
  };
}

export default function ({ userInfos, adminCredential }: Data): void {
  const defer: (() => void)[] = [];
  const { home: userHome, credential: userCredential } = userInfos[ exec.vu.idInTest - 1 ];
  const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);

  const userMeResponse = userClient.user.me();
  const [userDisplayName = userCredential.login] = queryJson('displayNamed', userMeResponse?.body);
  if (userDisplayName !== userCredential.login) {
    fail('userDisplayName does not match');
  }

  const driveCreateResponse = userClient.drive.create(randomString())
  const [spaceId] = queryJson('$.id', driveCreateResponse?.body);
  defer.push(() => {
    userClient.drive.delete(spaceId)
  });

  const folderCreationName = randomString();
  const folderMovedName = randomString();
  const assetName = randomString();
  userClient.resource.create(userHome, folderCreationName);
  defer.push(() => {
    return userClient.resource.delete(userHome, folderMovedName)
  });
  userClient.resource.move(userHome, folderCreationName, folderMovedName);
  userClient.resource.upload(userHome, [folderMovedName, assetName].join('/'), randomBytes(1000));
  userClient.resource.download(userHome, [folderMovedName, assetName].join('/'));

  const shareeSearchResponse = userClient.search.sharee(adminCredential.login, ItemType.folder)
  const [foundSharee] = queryJson('$..shareWith', shareeSearchResponse?.body)

  const createdShareResponse = userClient.share.create(folderMovedName,
    foundSharee,
    ShareType.user,
    Permission.all);
  const [createdShareId] = queryXml('ocs.data.id', createdShareResponse.body);
  if (!createdShareId) {
    fail('createdShareId is empty');
  }

  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);
  adminClient.share.accept(createdShareId);

  backOff(() => {
    const searchResponse = userClient.search.resource(userCredential.login, { query: folderMovedName })
    const [searchFileID] = queryXml('$..oc:fileid', searchResponse?.body);
    const found = !!searchFileID

    if(!found) {
      return Promise.reject()
    }

    const propfindResponse = userClient.resource.propfind(userHome, folderMovedName);
    const [expectedId] = queryXml('$..oc:fileid', propfindResponse?.body);

    check(undefined, {
      'test -> searchId and propfindId match': () => {
        return searchFileID === expectedId
      }
    })

    return Promise.resolve()
  }, { delay: 500, delayMultiplier: 1 }).then(() => {
    return defer.forEach((d) => {
      return d()
    })
  })
}

export function teardown({ userInfos, adminCredential }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);

  userInfos.forEach(({ credential }) => {
    return adminClient.user.delete(credential.login)
  });
}
