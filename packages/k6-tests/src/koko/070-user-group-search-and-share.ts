import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client, Version } from '@ownclouders/k6-tdk/lib/client';
import { ItemType, Permission, ShareType } from '@ownclouders/k6-tdk/lib/endpoints';
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
  home: string;
}

interface Data {
  adminCredential: Credential;
  userInfos: Info[];
  shareReceiverInfos: {
    users: Pick<Credential, 'login'>[],
    groups: { id: string, name: string }[]
  };
}

interface Settings {
  authAdapter: Adapter;
  baseURL: string;
  clientVersion: Version;
  adminUser: Credential;
  shareReceivers: {
    userCount: number;
    groupCount: number;
  };
  assets: {
    folderCount: number;
    textDocumentCount: number;
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
    password: __ENV.ADMIN_PASSWORD || 'admin'
  },
  shareReceivers: {
    groupCount: parseInt(__ENV.SHARE_RECEIVERS_GROUP_COUNT) || 1,
    userCount: parseInt(__ENV.SHARE_RECEIVERS_USER_COUNT) || 1
  },
  assets: {
    folderCount: parseInt(__ENV.ASSETS_FOLDER_COUNT) || 1,
    textDocumentCount: parseInt(__ENV.ASSETS_TEXT_DOCUMENT_COUNT) || 1
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

  const userInfos = times<Info>(options.vus || 1, () => {
    const userCredential = { login: randomString(), password: randomString() };
    adminClient.user.create(userCredential);
    adminClient.user.enable(userCredential.login);

    const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);
    const userDrivesResponse = userClient.user.drives();
    const [userHome = userCredential.login] = queryJson('$.value[?(@.driveType === \'personal\')].id', userDrivesResponse?.body);

    return {
      credential: userCredential,
      home: userHome
    };
  });

  const shareReceiverUserInfos = times<Credential>(settings.shareReceivers.userCount, () => {
    const shareeCredential = { login: randomString(), password: randomString() };
    adminClient.user.create(shareeCredential);
    adminClient.user.enable(shareeCredential.login);

    return shareeCredential
  })

  const shareReceiverGroupInfos = times<Data['shareReceiverInfos']['groups'][0]>(settings.shareReceivers.groupCount, () => {
    const groupName = randomString()
    const groupCreateResponse = adminClient.group.create(groupName)
    const [groupId = groupName] = queryJson('$.id', groupCreateResponse?.body);

    return {
      id: groupId,
      name: groupName
    }
  })

  return {
    adminCredential,
    userInfos,
    shareReceiverInfos: {
      users: shareReceiverUserInfos,
      groups: shareReceiverGroupInfos
    }
  };
}

export default function ({ userInfos, shareReceiverInfos }: Data): void {
  const defer: (() => void)[] = [];
  const { home: userHome, credential: userCredential } = userInfos[ exec.vu.idInTest - 1 ];
  const userClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, userCredential);
  const shareFolders = times(settings.assets.folderCount, () => {
    return randomString()
  })
  const shareTextDocuments = times(settings.assets.textDocumentCount, () => {
    return randomString()
  })

  const shareWith = (sharee: string, folder: string, shareType: ShareType, itemType: ItemType) => {
    const searchResponse = userClient.search.sharee(sharee, itemType)
    const [foundSharee] = queryJson('$..shareWith', searchResponse?.body)

    const createShareResponse = userClient.share.create(folder,
      foundSharee,
      shareType,
      Permission.all);

    const [foundShareRecipient] = queryXml('ocs.data.share_with', createShareResponse.body);
    const humanShareType = Object.keys(ShareType).find((key) => {
      return ShareType[ key ] === shareType
    })
    
    check(undefined, {
      [ `test -> sharee ( ${humanShareType} ) found` ]: () => {
        return sharee === foundSharee
      },
      [ `test -> share ( ${itemType} ) received` ]: () => {
        return sharee === foundShareRecipient
      }
    })
  }

  shareFolders.forEach((shareFolder) => {
    userClient.resource.create(userHome, shareFolder);

    shareReceiverInfos.users.forEach(({ login }) => {
      return shareWith(login, shareFolder, ShareType.user, ItemType.folder)
    })
    shareReceiverInfos.groups.forEach(({ name }) => {
      return shareWith(name, shareFolder, ShareType.group, ItemType.folder)
    })

    defer.push(() => {
      userClient.resource.delete(userHome, shareFolder)
    });
  })

  shareTextDocuments.forEach((shareTextDocument) => {
    userClient.resource.upload(userHome, shareTextDocument, randomString());

    shareReceiverInfos.users.forEach(({ login }) => {
      return shareWith(login, shareTextDocument, ShareType.user, ItemType.file)
    })
    shareReceiverInfos.groups.forEach(({ name }) => {
      return shareWith(name, shareTextDocument, ShareType.group, ItemType.file)
    })

    defer.push(() => {
      userClient.resource.delete(userHome, shareTextDocument)
    });
  })

  defer.forEach((d) => {
    return d()
  })
}

export function teardown({ userInfos, adminCredential, shareReceiverInfos }: Data): void {
  const adminClient = new Client(settings.baseURL, settings.clientVersion, settings.authAdapter, adminCredential);

  userInfos.forEach(({ credential }) => {
    return adminClient.user.delete(credential.login)
  });
  shareReceiverInfos.users.forEach(({ login }) => {
    return adminClient.user.delete(login)
  });
  shareReceiverInfos.groups.forEach(({ id }) => {
    return adminClient.group.delete(id)
  });
}
