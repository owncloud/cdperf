import { Client } from '@ownclouders/k6-tdk/lib/client'
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
    folders: string[][];
  }[];
}

/**/
const settings = {
  folder: {
    rootCount: parseInt(ENV('FOLDER_ROOT_COUNT', '5'), 10),
    childCount: parseInt(ENV('FOLDER_CHILD_COUNT', '5'), 10)
  }
}

/**/
export const options: Options = {
  vus: 1,
  insecureSkipTLSVerify: true
}
export function setup(): Environment {
  const adminClient = clientForAdmin()

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword })
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = new Client({ userLogin: actorLogin, userPassword: actorPassword })
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
    actorData
  }
}

const iterationBucket: {
  actorClient?: Client
} = {}

export default function actor({ actorData }: Environment): void {
  const { actorLogin, actorPassword, actorRoot, folders } = actorData[exec.vu.idInTest - 1]

  if (!iterationBucket.actorClient) {
    iterationBucket.actorClient = new Client({ userLogin: actorLogin, userPassword: actorPassword })
  }

  const { actorClient } = iterationBucket

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
export function teardown({ actorData }: Environment): void {
  const adminClient = clientForAdmin()

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
