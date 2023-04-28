import { Client } from '@ownclouders/k6-tdk/lib/client'
import { clientForAdmin } from '@ownclouders/k6-tdk/lib/snippets'
import { ENV, queryJson, randomString } from '@ownclouders/k6-tdk/lib/utils'
import { randomBytes } from 'k6/crypto'
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
  assets: {
    small: {
      size: parseInt(ENV('ASSET_SMALL_SIZE', '10'), 10),
      quantity: parseInt(ENV('ASSET_SMALL_QUANTITY', '1'), 10)
    },
    medium: {
      size: parseInt(ENV('ASSET_MEDIUM_SIZE', String(10 * 10)), 10),
      quantity: parseInt(ENV('ASSET_MEDIUM_QUANTITY', '1'), 10)
    },
    large: {
      size: parseInt(ENV('ASSET_LARGE_SIZE', String(10 * 100)), 10),
      quantity: parseInt(ENV('ASSET_LARGE_QUANTITY', '1'), 10)
    }
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
  const defer: (() => void)[] = []

  Object.keys(settings.assets).forEach((k) => {
    const { quantity, size } = settings.assets[k]
    times(quantity, (i) => {
      const assetName = [exec.scenario.iterationInTest, k, i].join('-')

      actorClient.resource.uploadResource({ root: actorRoot, resourcePath: assetName, resourceBytes: randomBytes(size * 1000) })
      defer.push(() => {
        actorClient.resource.deleteResource({ root: actorRoot, resourcePath: assetName })
      })
    })
  })

  defer.forEach((c) => {
    c()
  })
}

export function teardown({ actorData }: Environment): void {
  const adminClient = clientForAdmin()

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
