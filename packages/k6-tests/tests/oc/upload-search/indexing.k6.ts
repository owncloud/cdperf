import {  ENV, queryJson,  queryXml, randomString, store, check  } from '@ownclouders/k6-tdk/lib/utils'
import { Permission, ShareType } from '@ownclouders/k6-tdk/lib/values'
import { randomBytes } from 'k6/crypto'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { sleep } from 'k6'
import { times } from 'lodash'

import { clientFor } from '@/shortcuts'
import { envValues } from '@/values'

// eslint-disable-next-line no-restricted-globals
const t1docX = open('../data/test1.docx', 'b')

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
}
/**/

export const options: Options = {
  vus: 1,
  insecureSkipTLSVerify: true,
}

export function setup(): Environment {
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })
  const getMyDrivesResponseAdmin = adminClient.me.getMyDrives({ params: { $filter: "driveType eq 'personal'" } })
  const [adminRoot = settings.admin.login] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponseAdmin?.body)

  adminClient.resource.createResource({ root: adminRoot, resourcePath: settings.testFolder })

  const actorData = times(options.vus || 1, () => {
    const [actorLogin, actorPassword] = [randomString(), randomString()]
    adminClient.user.createUser({ userLogin: actorLogin, userPassword: actorPassword })
    adminClient.user.enableUser({ userLogin: actorLogin })

    const actorClient = clientFor({ userLogin: actorLogin, userPassword: actorPassword })
    const getMyDrivesResponseActor = actorClient.me.getMyDrives({ params: { $filter: "driveType eq 'personal'" } })
    const [actorRoot = actorLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponseActor?.body)

    actorClient.resource.createResource({ root: actorRoot, resourcePath: "initial" })

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


  const filename = [randomString(), exec.scenario.iterationInTest, '.docx'].join('')
  actorClient.resource.uploadResource({
    root: actorRoot,
    resourcePath: ["initial", filename].join('/'),
    resourceBytes: t1docX
  })

  // We're focused on response times so we don't care about the result, just the status code.
  // No need to wait for indexing.

  const resp = actorClient.search.searchForResources({
    root: actorRoot,
    searchQuery: `(name:\"*${filename}*\" OR content:\"${filename}\")`,
  })
  check({val: resp}, {
    'search -> status': ({ status }) => status === 207,
  })
}

export function teardown({ adminData, actorData }: Environment): void {
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })

  adminClient.resource.deleteResource({ root: adminData.adminRoot, resourcePath: settings.testFolder })
  actorData.forEach(({ actorLogin }) => {
    adminClient.user.deleteUser({ userLogin: actorLogin })
  })
}
