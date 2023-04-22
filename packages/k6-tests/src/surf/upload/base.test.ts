import { Platform } from '@ownclouders/k6-tdk'
import { Adapter } from '@ownclouders/k6-tdk/lib/auth'
import { Client } from '@ownclouders/k6-tdk/lib/client'
import { queryJson, randomString } from '@ownclouders/k6-tdk/lib/utils'
import { randomBytes } from 'k6/crypto'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { times } from 'lodash'

interface Environment {
  adminData: {
    adminLogin: string;
    adminPassword: string;
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

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    const createUserResponse = adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword })
    const [actorId] = queryJson('$.id', createUserResponse.body)
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword })
    const getMyDrivesResponse = actorClient.me.getMyDrives()
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body)

    return {
      actorLogin,
      actorPassword,
      actorId,
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
  const { actorLogin, actorPassword, actorRoot } = actorData[exec.vu.idInTest - 1]
  const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword })
  const data = randomBytes(settings.assets.size * 1000)

  times(settings.assets.quantity, (i) => {
    actorClient.resource.uploadResource({
      root: actorRoot,
      resourcePath: [exec.scenario.iterationInTest, actorLogin, i].join('-'),
      resourceBytes: data
    })
  })
}

export function teardown({ adminData, actorData }: Environment): void {
  const adminClient = new Client({ ...settings, userLogin: adminData.adminLogin, userPassword: adminData.adminPassword })

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
