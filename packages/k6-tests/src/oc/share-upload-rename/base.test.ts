import { Platform } from '@ownclouders/k6-tdk'
import { Adapter } from '@ownclouders/k6-tdk/lib/auth'
import { Client } from '@ownclouders/k6-tdk/lib/client'
import { Permission, ShareType } from '@ownclouders/k6-tdk/lib/endpoints'
import { queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils'
import { randomBytes } from 'k6/crypto'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { times } from 'lodash'

interface Environment {
  adminData: {
    adminLogin: string;
    adminPassword: string;
    adminRoot: string;
  };
  actorData: {
    actorLogin: string;
    actorPassword: string;
    actorRoot: string;
  }[];
}

/**/
const settings = {
  platformUrl: __ENV.PLATFORM_URL || 'https://localhost:9200',
  authAdapter: Adapter[__ENV.AUTH_ADAPTER] || Adapter.kopano,
  platform: Platform[__ENV.PLATFORM] || Platform.ownCloudInfiniteScale,
  admin: {
    login: __ENV.ADMIN_LOGIN || 'admin',
    password: __ENV.ADMIN_PASSWORD || 'admin'
  },
  testFolder: __ENV.TEST_FOLDER || 'oc-share-upload-rename',
  assets: {
    size: parseInt(__ENV.ASSET_SIZE, 10) || 1000,
    quantity: parseInt(__ENV.ASSET_QUANTITY, 10) || 10
  },
  k6: {
    vus: 1,
    insecureSkipTLSVerify: true
  }
}

/**/
export const options: Options = settings.k6

export function setup(): Environment {
  const adminClient = new Client({ ...settings, userLogin: settings.admin.login, userPassword: settings.admin.password })
  const getMyDrivesResponseAdmin = adminClient.me.getMyDrives()
  const [adminRoot = settings.admin.login] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponseAdmin?.body)

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

    const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword })
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
      adminLogin: settings.admin.login,
      adminPassword: settings.admin.password,
      adminRoot
    },
    actorData
  }
}

export default function actor({ actorData }: Environment): void {
  const { actorLogin, actorPassword, actorRoot } = actorData[exec.vu.idInTest - 1]
  const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword })

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
  const adminClient = new Client({ ...settings, userLogin: adminData.adminLogin, userPassword: adminData.adminPassword })

  adminClient.resource.deleteResource({ root: adminData.adminRoot, resourcePath: settings.testFolder })
  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
