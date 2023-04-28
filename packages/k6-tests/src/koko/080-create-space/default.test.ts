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
  }[];
}

/**/
const settings = {
  spaceCount: parseInt(ENV('SPACE_COUNT', '2'), 10)
}

/**/
export const options: Options = {
  vus: 1,
  insecureSkipTLSVerify: true
}
export function setup(): Environment {
  const adminClient = clientForAdmin()
  const getRolesResponse = adminClient.role.getRoles()
  const [appRoleId] = queryJson("$.bundles[?(@.name === 'spaceadmin')].id", getRolesResponse?.body)
  const listApplicationsResponse = adminClient.application.listApplications()
  const [resourceId] = queryJson("$.value[?(@.displayName === 'ownCloud Infinite Scale')].id", listApplicationsResponse?.body)

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    const createUserResponse = adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword })
    const [principalId] = queryJson('$.id', createUserResponse.body)

    adminClient.role.addRoleToUser({ appRoleId, resourceId, principalId })

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
  const defer: (() => void)[] = []
  const spaceNames = times(settings.spaceCount, () => {
    return randomString()
  })

  spaceNames.forEach((driveName) => {
    const driveCreateResponse = actorClient.drive.createDrive({ driveName })
    const [driveId] = queryJson('$.id', driveCreateResponse?.body)

    defer.push(() => {
      actorClient.drive.deleteDrive({ driveId })
    })
  })

  defer.forEach((d) => {
    d()
  })
}

export function teardown({ actorData }: Environment): void {
  const adminClient = clientForAdmin()

  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
