import { Client } from '@ownclouders/k6-tdk/lib/client'
import { Permission, ShareType } from '@ownclouders/k6-tdk/lib/endpoints'
import { clientForAdmin, defaultAdmin } from '@ownclouders/k6-tdk/lib/snippets'
import { ENV, queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils'
import { randomBytes } from 'k6/crypto'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { times } from 'lodash'

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
  const adminClient = clientForAdmin()
  const getMyDrivesResponseAdmin = adminClient.me.getMyDrives()
  const [adminRoot = defaultAdmin.login] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponseAdmin?.body)

  adminClient.resource.createResource({ root: adminRoot, resourcePath: settings.testFolder })

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword })
    adminClient.user.enableUser({ userLogin: actorLogin })

    const createShareResponse = adminClient.share.createShare({
      shareResourcePath: settings.testFolder,
      shareReceiver: actorLogin,
      shareType: ShareType.user,
      shareReceiverPermission: Permission.all
    })
    const [createdShareId] = queryXml('ocs.data.id', createShareResponse.body)

    const actorClient = new Client({ userLogin: actorLogin, userPassword: actorPassword })
    const getMyDrivesResponseActor = actorClient.me.getMyDrives()
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponseActor?.body)
    actorClient.share.acceptShare({ shareId: createdShareId })

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

const iterationBucket: {
  actorClient?: Client
} = {}


export default function actor({ actorData }: Environment): void {
  const { actorLogin, actorPassword, actorRoot } = actorData[exec.vu.idInTest - 1]

  if (!iterationBucket.actorClient) {
    iterationBucket.actorClient = new Client({ userLogin: actorLogin, userPassword: actorPassword })
  }

  const { actorClient } = iterationBucket
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
  const adminClient = clientForAdmin()

  adminClient.resource.deleteResource({ root: adminData.adminRoot, resourcePath: settings.testFolder })
  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
