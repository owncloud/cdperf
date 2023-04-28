import { Client } from '@ownclouders/k6-tdk/lib/client'
import { ItemType, Permission, ShareType } from '@ownclouders/k6-tdk/lib/endpoints'
import { clientForAdmin } from '@ownclouders/k6-tdk/lib/snippets'
import { check, ENV, queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { times } from 'lodash'

interface Environment {
  actorData: {
    actorLogin: string;
    actorPassword: string;
    actorRoot: string;
  }[];
  shareReceivers: {
    users: { userLogin: string; }[],
    groups: { groupId: string, groupName: string }[]
  };
}

/**/
const settings = {
  shareReceivers: {
    groupCount: parseInt(ENV('SHARE_RECEIVERS_GROUP_COUNT', '1'), 10),
    userCount: parseInt(ENV('SHARE_RECEIVERS_USER_COUNT', '1'), 10)
  },
  assets: {
    folderCount: parseInt(ENV('ASSETS_FOLDER_COUNT', '1'), 10),
    textDocumentCount: parseInt(ENV('ASSETS_TEXT_DOCUMENT_COUNT', '1'), 10)
  }
}

/**/
export const options: Options = {
  vus: 1,
  insecureSkipTLSVerify: true
}
export function setup(): Environment {
  const adminClient = clientForAdmin()

  const shareReceiverUsers = times(settings.shareReceivers.userCount, () => {
    const [userLogin, userPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin, userPassword })
    adminClient.user.enableUser({ userLogin })

    return {
      userLogin
    }
  })

  const shareReceiverGroups = times(settings.shareReceivers.groupCount, () => {
    const groupName = randomString()
    const groupCreateResponse = adminClient.group.createGroup({ groupName })
    const [groupId] = queryJson('$.id', groupCreateResponse?.body)

    return {
      groupId,
      groupName
    }
  })

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword })
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = new Client({ userLogin: actorLogin, userPassword: actorPassword })
    const getMyDrivesResponse = actorClient.me.getMyDrives()
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body)

    return {
      actorLogin,
      actorPassword,
      actorRoot
    }
  })

  return {
    actorData,
    shareReceivers: {
      users: shareReceiverUsers,
      groups: shareReceiverGroups
    }
  }
}

const iterationBucket: {
  actorClient?: Client
} = {}

export default function actor({ actorData, shareReceivers }: Environment): void {
  const { actorLogin, actorPassword, actorRoot } = actorData[exec.vu.idInTest - 1]

  if (!iterationBucket.actorClient) {
    iterationBucket.actorClient = new Client({ userLogin: actorLogin, userPassword: actorPassword })
  }

  const { actorClient } = iterationBucket
  const defer: (() => void)[] = []
  const shareFolders = times(settings.assets.folderCount, () => {
    return randomString()
  })
  const shareTextDocuments = times(settings.assets.textDocumentCount, () => {
    return randomString()
  })

  const shareWith = (sharee: string, folder: string, shareType: ShareType, itemType: ItemType) => {
    const searchResponse = actorClient.search.searchForSharees({ searchQuery: sharee, searchItemType: itemType })
    const [foundSharee] = queryJson('$..shareWith', searchResponse?.body)
    const createShareResponse = actorClient.share.createShare({
      shareType,
      shareResourcePath: folder,
      shareReceiver: foundSharee,
      shareReceiverPermission: Permission.all
    })

    const [foundShareRecipient] = queryXml('ocs.data.share_with', createShareResponse.body)
    const humanShareType = Object.keys(ShareType).find((key) => {
      return ShareType[key] === shareType
    })

    check({ val: undefined }, {
      [`test -> sharee ( ${humanShareType} ) found`]: () => {
        return sharee === foundSharee
      },
      [`test -> share ( ${itemType} ) received`]: () => {
        return sharee === foundShareRecipient
      }
    })
  }

  shareFolders.forEach((shareFolder) => {
    actorClient.resource.createResource({ root: actorRoot, resourcePath: shareFolder })

    shareReceivers.users.forEach(({ userLogin }) => {
      return shareWith(userLogin, shareFolder, ShareType.user, ItemType.folder)
    })
    shareReceivers.groups.forEach(({ groupName }) => {
      return shareWith(groupName, shareFolder, ShareType.group, ItemType.folder)
    })

    defer.push(() => {
      actorClient.resource.deleteResource({ root: actorRoot, resourcePath: shareFolder })
    })
  })

  shareTextDocuments.forEach((shareTextDocument) => {
    actorClient.resource.uploadResource({
      root: actorRoot,
      resourcePath: shareTextDocument,
      resourceBytes: randomString()
    })

    shareReceivers.users.forEach(({ userLogin }) => {
      return shareWith(userLogin, shareTextDocument, ShareType.user, ItemType.file)
    })
    shareReceivers.groups.forEach(({ groupName }) => {
      return shareWith(groupName, shareTextDocument, ShareType.group, ItemType.file)
    })

    defer.push(() => {
      actorClient.resource.deleteResource({ root: actorRoot, resourcePath: shareTextDocument })
    })
  })

  defer.forEach((d) => {
    d()
  })
}

export function teardown({ actorData, shareReceivers }: Environment): void {
  const adminClient = clientForAdmin()

  shareReceivers.users.forEach((user) => {
    return adminClient.user.deleteUser(user)
  })

  shareReceivers.groups.forEach(({ groupId, groupName }) => {
    return adminClient.group.deleteGroup({ groupIdOrName: groupId || groupName })
  })

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
