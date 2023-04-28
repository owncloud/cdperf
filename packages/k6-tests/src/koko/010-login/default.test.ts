import { Client } from '@ownclouders/k6-tdk/lib/client'
import { clientForAdmin, defaultPlatform } from '@ownclouders/k6-tdk/lib/snippets'
import { check, platformGuard, queryJson, randomString } from '@ownclouders/k6-tdk/lib/utils'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { times } from 'lodash'

interface Environment {
  actorData: {
    actorLogin: string;
    actorPassword: string;
  }[];
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

    return {
      actorLogin,
      actorPassword
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
  const { actorLogin, actorPassword } = actorData[exec.vu.idInTest - 1]

  if (!iterationBucket.actorClient) {
    iterationBucket.actorClient = new Client({ userLogin: actorLogin, userPassword: actorPassword })
  }

  const { actorClient } = iterationBucket
  const getMyProfileResponse = actorClient.me.getMyProfile()
  const guards = { ...platformGuard(defaultPlatform.type) }

  check({ skip: guards.isOwnCloudServer || guards.isNextcloud, val: getMyProfileResponse }, {
    'user displayName': (r) => {
      const [displayName] = queryJson('displayName', r?.body)
      return displayName === actorLogin
    }
  })

}

export function teardown({ actorData }: Environment): void {
  const adminClient = clientForAdmin()

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
