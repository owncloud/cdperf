import { ENV, queryXml } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import { Options } from 'k6/options'

import { userPool } from '@/pools'
import { clientFor } from '@/shortcuts'
import { createTestRoot, deleteTestRoot } from '@/test'
import { getPoolItem } from '@/utils'
import { envValues, TestRootType } from '@/values'

// HC variant of 010-open-change-save without the OnlyOffice WS leg. Used for
// per-school auth + drive smoke on env where OnlyOffice is not yet wired up
// or not under test (int/vp). Exercises the same flow as the office HC test
// up to (but not including) the WSS session: login -> create folder -> upload
// docx -> fetch resource properties -> teardown.

export interface Environment {
  testRoot: string;
}

// eslint-disable-next-line no-restricted-globals
const docX = open('../data/sample.docx', 'b')

export const options: Options = {
  vus: 1,
  iterations: 1,
  insecureSkipTLSVerify: true
}

const settings = {
  ...envValues(),
  get docx() {
    return ENV('DOCX', [settings.seed.resource.root, 'sample.docx'].join('/'))
  }
}

const hcUser = () => getPoolItem({ pool: userPool, n: 1 })

export const open_change_save_010_hc_no_office_setup = async (): Promise<Environment> => {
  const user = hcUser()
  const client = clientFor(user)

  const rootInfo = await createTestRoot({
    client,
    userLogin: user.userLogin,
    platform: settings.platform.type,
    resourceName: settings.seed.container.name,
    resourceType: TestRootType.directory
  })

  const testRoot = [rootInfo.root, rootInfo.path].join('/')

  client.resource.uploadResource({
    root: testRoot,
    resourcePath: settings.docx,
    resourceBytes: docX
  })

  return { testRoot }
}

export const open_change_save_010_hc_no_office = async ({ testRoot }: Environment): Promise<void> => {
  const user = hcUser()
  const ocisClient = clientFor(user)

  const getResourcePropertiesResponse = await ocisClient.resource.getResourceProperties({
    root: testRoot,
    resourcePath: settings.docx
  })
  sleep(settings.sleep.after_request)

  // Touch the same XML path the office variant relies on, so a parsing
  // regression here surfaces in this lighter test too.
  queryXml("$..['oc:fileid']", getResourcePropertiesResponse.body)

  sleep(settings.sleep.after_iteration)
}

export const open_change_save_010_hc_no_office_teardown = async (): Promise<void> => {
  const user = hcUser()
  const client = clientFor(user)
  await deleteTestRoot({
    client,
    userLogin: user.userLogin,
    platform: settings.platform.type,
    resourceName: settings.seed.container.name,
    resourceType: TestRootType.directory
  })
}

export const setup = open_change_save_010_hc_no_office_setup
export default open_change_save_010_hc_no_office
export const teardown = open_change_save_010_hc_no_office_teardown
