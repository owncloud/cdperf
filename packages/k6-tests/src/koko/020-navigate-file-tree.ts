import { Platform } from '@ownclouders/k6-tdk'
import { Adapter } from '@ownclouders/k6-tdk/lib/auth'
import { Client } from '@ownclouders/k6-tdk/lib/client'
import { check, queryJson, queryXml, randomString } from '@ownclouders/k6-tdk/lib/utils'
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
    folders: string[][];
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
  folder: {
    rootCount: parseInt(__ENV.FOLDER_ROOT_COUNT, 10) || 5,
    childCount: parseInt(__ENV.FOLDER_CHILD_COUNT, 10) || 5
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
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword })
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword })
    const getMyDrivesResponse = actorClient.me.getMyDrives()
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body)

    const folders = times(settings.folder.rootCount, () => {
      const tree = times(settings.folder.childCount, () => {
        return randomString()
      })

      return tree.reduce((acc: string[], name) => {
        acc.push(name)
        actorClient.resource.createResource({ root: actorRoot, resourcePath: acc.join('/') })

        return acc
      }, [])
    })

    return {
      actorLogin,
      actorPassword,
      actorRoot,
      folders
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
  const { actorLogin, actorPassword, actorRoot, folders } = actorData[exec.vu.idInTest - 1]
  const actorClient = new Client({ ...settings, userLogin: actorLogin, userPassword: actorPassword })

  folders.forEach((paths) => {
    for (let i = 1; i <= paths.length; i += 1) {
      const resourcePath = paths.slice(0, i).join('/')
      const getResourcePropertiesRequest = actorClient.resource.getResourceProperties({
        root: actorRoot,
        resourcePath
      })

      check({ val: getResourcePropertiesRequest }, {
        'test -> resource.getResourceProperties - path - match': ({ body }) => {
          const [href = ''] = queryXml("$..['d:href']", body)
          return href.endsWith(`${resourcePath}/`)
        }
      })
    }
  })
}
export function teardown({ adminData, actorData }: Environment): void {
  const adminClient = new Client({ ...settings, userLogin: adminData.adminLogin, userPassword: adminData.adminPassword })

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
