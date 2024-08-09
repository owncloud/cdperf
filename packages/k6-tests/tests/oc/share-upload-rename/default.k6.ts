import {  ENV, queryJson,  queryXml, randomString, store  } from '@ownclouders/k6-tdk/lib/utils'
import { Roles, ShareType } from '@ownclouders/k6-tdk/lib/values'
import { randomBytes } from 'k6/crypto'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { times } from 'lodash'

import { clientFor } from '@/shortcuts'
import { envValues } from '@/values'

export interface Environment {
  adminData: {
    adminRoot: string;
  };
  actorData: {
    actorLogin: string;
    actorPassword: string;
    actorRoot: string;
  }[];
}

/**/
export const settings = {
  ...envValues(),
  testFolder: ENV('TEST_FOLDER', 'oc-share-upload-rename-base'),
  assets: {
    size: parseInt(ENV('ASSET_SIZE', '1000'), 10),
    quantity: parseInt(ENV('ASSET_QUANTITY', '10'), 10)
  }
}

/**/
export const options: Options = {
  vus: 1,
  insecureSkipTLSVerify: true
}

export function setup(): Environment {
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })
  const getMyDrivesResponseAdmin = adminClient.me.getMyDrives({ params: { $filter: "driveType eq 'personal'" } })
  const [adminRoot = settings.admin.login] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponseAdmin?.body)

  adminClient.resource.createResource({ root: adminRoot, resourcePath: settings.testFolder })
  const getResourcePropertiesResponse = adminClient.resource.getResourceProperties({ root: adminRoot, resourcePath: settings.testFolder })
  const [sharedFolderFileId] = queryXml("$..['oc:fileid']", getResourcePropertiesResponse.body)

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword })
    adminClient.user.enableUser({ userLogin: actorLogin })

    const searchForRecipientResponse = adminClient.user.findUser({ user: actorLogin })
    const [recipientId] = queryJson('$.value[*].id', searchForRecipientResponse?.body)

    adminClient.share.createShareInvitation({
      driveId: adminRoot,
      itemId: sharedFolderFileId,
      recipientId,
      roleId: Roles.editor,
      shareType: ShareType.user
    })

    const actorClient = clientFor({ userLogin: actorLogin, userPassword: actorPassword })
    const getMyDrivesResponseActor = actorClient.me.getMyDrives({ params: { $filter: "driveType eq 'personal'" } })
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponseActor?.body)

    return {
      actorLogin,
      actorPassword,
      actorRoot
    }
  })

  return {
    adminData: {
      adminRoot
    },
    actorData
  }
}


export default async function actor({ actorData }: Environment): Promise<void> {
  const { actorLogin, actorPassword, actorRoot } = actorData[exec.vu.idInTest - 1]
  const actorStore = store(actorLogin)

  const actorClient = await actorStore.setOrGet('client', async () => {
    return clientFor({ userLogin: actorLogin, userPassword: actorPassword })
  })

  const folderCreationName = [exec.scenario.iterationInTest, 'initial', actorLogin].join('-')
  actorClient.resource.createResource({ root: actorRoot, resourcePath: folderCreationName })

  const data = randomBytes(settings.assets.size * 1000)
  times(settings.assets.quantity, (i) => {
    actorClient.resource.uploadResource({
      root: actorRoot,
      resourcePath: [folderCreationName, i].join('/'),
      resourceBytes: data
    })
  })

  const folderMovedName = [exec.scenario.iterationInTest, 'final', actorLogin].join('-')
  actorClient.resource.moveResource({
    root: actorRoot,
    fromResourcePath: folderCreationName,
    toResourcePath: folderMovedName
  })
}

export function teardown({ adminData, actorData }: Environment): void {
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })

  adminClient.resource.deleteResource({ root: adminData.adminRoot, resourcePath: settings.testFolder })
  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
