import { Client } from '@ownclouders/k6-tdk/lib/client'
import { clientForAdmin } from '@ownclouders/k6-tdk/lib/snippets'
import { ENV, queryJson, randomString } from '@ownclouders/k6-tdk/lib/utils'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { times } from 'lodash'

interface Environment {
  actorData: {
    actorLogin: string;
    actorPassword: string;
    actorRoot: string;
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

    return {
      actorLogin,
      actorPassword,
      actorRoot
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
  const { actorLogin, actorPassword, actorRoot } = actorData[exec.vu.idInTest - 1]

  if (!iterationBucket.actorClient) {
    iterationBucket.actorClient = new Client({ userLogin: actorLogin, userPassword: actorPassword })
  }

  const { actorClient } = iterationBucket

  times(settings.folder.rootCount, () => {
    const tree = times(settings.folder.childCount, () => {
      return randomString()
    })

    tree.reduce((acc: string[], name) => {
      const createPath = [...acc, name].join('/')
      actorClient.resource.createResource({ root: actorRoot, resourcePath: createPath })

      acc.push(`rename-${name}`)
      actorClient.resource.moveResource({ root: actorRoot, fromResourcePath: createPath, toResourcePath: acc.join('/') })

      return acc
    }, [])
  })
}

export function teardown({ actorData }: Environment): void {
  const adminClient = clientForAdmin()

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
