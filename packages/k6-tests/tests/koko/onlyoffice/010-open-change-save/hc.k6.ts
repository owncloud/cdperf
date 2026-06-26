import { cleanURL, ENV, queryXml, store } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Counter } from 'k6/metrics'
import { Options } from 'k6/options'

import { Client, obtainDocumentInformation } from '@/clients/onlyoffice'
import { userPool } from '@/pools'
import { clientFor } from '@/shortcuts'
import { createTestRoot, deleteTestRoot } from '@/test'
import { getPoolItem } from '@/utils'
import { envValues, TestRootType } from '@/values'

// HC variant of 010-open-change-save: the pool user (a single ByCS HC user)
// is also the resource owner — no shared admin needed. Everything happens on
// the user's personal drive.

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

const ooClientErrors = new Counter('oo_client_errors')

const hcUser = () => getPoolItem({ pool: userPool, n: 1 })

export const open_change_save_010_hc_setup = async (): Promise<Environment> => {
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

export const open_change_save_010_hc = async ({ testRoot }: Environment): Promise<void> => {
  const user = hcUser()
  const userStore = store(user.userLogin)

  const documentInformation = await userStore.setOrGet('root', async () => {
    const ocisClient = clientFor(user)

    const getResourcePropertiesResponse = await ocisClient.resource.getResourceProperties({
      root: testRoot,
      resourcePath: settings.docx
    })
    sleep(settings.sleep.after_request)

    const [resourceId] = queryXml("$..['oc:fileid']", getResourcePropertiesResponse.body)

    return obtainDocumentInformation({ client: ocisClient, appName: settings.only_office.app_name, resourceId })
  })

  const ooClient = new Client({
    ...documentInformation,
    url: cleanURL(settings.only_office.wss_url, 'doc', documentInformation.documentId, 'c/?EIO=4&transport=websocket')
  })

  ooClient.onError((err) => {
    console.error(err?.error)
    ooClientErrors.add(1, { errorType: err?.error || 'unknown' })
  })

  await ooClient.establishSession()
  sleep(settings.sleep.after_request)

  const changes = JSON.stringify([
    '78;AgAAADEA//8BAPOWPfV/JwAAnwAAABgAAAABAAAAAQAAAAEAAAAMAAAADAAAABwAAAA3AC4AMwAuADMALgA1ADAALgBAAEAAUgBlAHYA',
    '58;AgAAADEAAQABAAoAAAAyAF8ANgAzADUAAAAEAAMAAAAKAAAAMgBfADYAMwA1AACAIAAAAAAAAAAAAA==',
    '98;AgAAADEAAQABAAoAAAAyAF8ANgAzADYAAAAcACcAAAAKAAAAMgBfADYAMwA2AAoAAAAyAF8ANgAzADQAAIAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    '34;CgAAADIAXwA2ADMANgABABwAAQAAAAAAAAAEAAAAAwAAAA==',
    '87;AgAAADEAAQABAAoAAAAyAF8ANgAzADQAAAADAAoAAAAyAF8ANgAzADQAQgAAAAAAAAAAAAAACgAAADIAXwA2ADMANQABAAAACgAAADIAXwA2ADMANgAB',
    '98;AgAAADEAAQABAAoAAAAyAF8ANgAzADcAAAAcACcAAAAKAAAAMgBfADYAMwA3AAoAAAAyAF8ANgAzADQAAIAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAAAAAABAAAAQQAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAEAAAABAAAAQgAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAIAAAABAAAAQwAAAAADAAAA',
    '44;CgAAADIAXwA2ADMANAABAAMAAQAAAAAAAAAKAAAAMgBfADYAMwA3AAAAAAA=',
    '36;AgAAADIAAQACAAEAAAABAAAACgAAADIAXwA2ADMANAAAAAAA'
  ])

  await ooClient.makeChanges({ changes })
  sleep(settings.sleep.after_request)

  ooClient.disconnect()
  sleep(settings.sleep.after_iteration)
}

export const open_change_save_010_hc_teardown = async (): Promise<void> => {
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

export const setup = open_change_save_010_hc_setup
export default open_change_save_010_hc
export const teardown = open_change_save_010_hc_teardown
