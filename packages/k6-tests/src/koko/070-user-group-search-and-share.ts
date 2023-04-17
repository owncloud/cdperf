import { Platform } from '@ownclouders/k6-tdk';
import { Adapter } from '@ownclouders/k6-tdk/lib/auth';
import { Client } from '@ownclouders/k6-tdk/lib/client';
import { ItemType, Permission, ShareType } from '@ownclouders/k6-tdk/lib/endpoints';
import { check, queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils';
import exec from 'k6/execution';
import { Options } from 'k6/options';
import { times } from 'lodash';

interface Environment {
  adminData: {
    adminLogin: string;
    adminPassword: string;
  };
  actorData: {
    actorLogin: string;
    actorPassword: string;
    actorRoot: string;
    shareReceivers: {
      users: { userLogin: string; }[],
      groups: { groupId: string, groupName: string }[]
    };
  }[];
}

/**/
const settings = {
  baseUrl: __ENV.BASE_URL || 'https://localhost:9200',
  authAdapter: __ENV.AUTH_ADAPTER === Adapter.basicAuth ? Adapter.basicAuth : Adapter.kopano,
  platform: Platform[__ENV.PLATFORM] || Platform.ownCloudInfiniteScale,
  admin: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin'
  },
  shareReceivers: {
    groupCount: parseInt(__ENV.SHARE_RECEIVERS_GROUP_COUNT, 10) || 1,
    userCount: parseInt(__ENV.SHARE_RECEIVERS_USER_COUNT, 10) || 1
  },
  assets: {
    folderCount: parseInt(__ENV.ASSETS_FOLDER_COUNT, 10) || 1,
    textDocumentCount: parseInt(__ENV.ASSETS_TEXT_DOCUMENT_COUNT, 10) || 1
  },
  k6: {
    vus: 1,
    insecureSkipTLSVerify: true
  }
};

/**/
export const options: Options = settings.k6;

export function setup(): Environment {
  const adminClient = new Client({ ...settings, userLogin: settings.admin.login, userPassword: settings.admin.password });

  const shareReceiverUsers = times(settings.shareReceivers.userCount, () => {
    const [userLogin, userPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin, userPassword });
    adminClient.user.enableUser({ userLogin })

    return {
      userLogin
    };
  });

  const shareReceiverGroups = times(settings.shareReceivers.groupCount, () => {
    const groupName = randomString();
    const groupCreateResponse = adminClient.group.createGroup({ groupName });
    const [groupId] = queryJson('$.id', groupCreateResponse?.body);

    return {
      groupId,
      groupName
    };
  });

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword });
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword });
    const getMyDrivesResponse = actorClient.me.getMyDrives();
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body);

    return {
      actorLogin,
      actorPassword,
      shareReceivers: {
        users: shareReceiverUsers,
        groups: shareReceiverGroups
      },
      actorRoot
    }
  })

  return {
    adminData: {
      adminLogin: settings.admin.login,
      adminPassword: settings.admin.password
    },
    actorData
  }
}

export default function actor({ actorData }: Environment): void {
  const { actorLogin, actorPassword, actorRoot, shareReceivers } = actorData[exec.vu.idInTest - 1];
  const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword });
  const defer: (() => void)[] = [];
  const shareFolders = times(settings.assets.folderCount, () => {
    return randomString();
  });
  const shareTextDocuments = times(settings.assets.textDocumentCount, () => {
    return randomString();
  });

  const shareWith = (sharee: string, folder: string, shareType: ShareType, itemType: ItemType) => {
    const searchResponse = actorClient.search.searchForSharees({ searchQuery: sharee, searchItemType: itemType });
    const [foundSharee] = queryJson('$..shareWith', searchResponse?.body);
    const createShareResponse = actorClient.share.createShare({
      shareType,
      shareResourcePath: folder,
      shareReceiver: foundSharee,
      shareReceiverPermission: Permission.all
    })

    const [foundShareRecipient] = queryXml('ocs.data.share_with', createShareResponse.body);
    const humanShareType = Object.keys(ShareType).find((key) => {
      return ShareType[key] === shareType;
    });

    check({ val: undefined }, {
      [`test -> sharee ( ${humanShareType} ) found`]: () => {
        return sharee === foundSharee;
      },
      [`test -> share ( ${itemType} ) received`]: () => {
        return sharee === foundShareRecipient;
      }
    });
  };

  shareFolders.forEach((shareFolder) => {
    actorClient.resource.createResource({ root: actorRoot, resourcePath: shareFolder });

    shareReceivers.users.forEach(({ userLogin }) => {
      return shareWith(userLogin, shareFolder, ShareType.user, ItemType.folder);
    });
    shareReceivers.groups.forEach(({ groupName }) => {
      return shareWith(groupName, shareFolder, ShareType.group, ItemType.folder);
    });

    defer.push(() => {
      actorClient.resource.deleteResource({ root: actorRoot, resourcePath: shareFolder });
    });
  });

  shareTextDocuments.forEach((shareTextDocument) => {
    actorClient.resource.uploadResource({ root: actorRoot, resourcePath: shareTextDocument, resourceBytes: randomString() });

    shareReceivers.users.forEach(({ userLogin }) => {
      return shareWith(userLogin, shareTextDocument, ShareType.user, ItemType.file);
    });
    shareReceivers.groups.forEach(({ groupName }) => {
      return shareWith(groupName, shareTextDocument, ShareType.group, ItemType.file);
    });

    defer.push(() => {
      actorClient.resource.deleteResource({ root: actorRoot, resourcePath: shareTextDocument });
    });
  });

  defer.forEach((d) => {
    d();
  });
}

export function teardown({ adminData, actorData }: Environment): void {
  const adminClient = new Client({ ...settings, userLogin: adminData.adminLogin, userPassword: adminData.adminPassword });

  actorData.forEach(({ actorLogin, shareReceivers: { users, groups } }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin });

    users.forEach((user) => {
      return adminClient.user.deleteUser(user);
    });
    
    groups.forEach(({ groupId, groupName }) => {
      return adminClient.group.deleteGroup({ groupIdOrName: groupId || groupName });
    });
  });
}
