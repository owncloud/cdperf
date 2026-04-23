import { cleanURL, ENV, queryXml, store } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Counter } from 'k6/metrics'
import { Options } from 'k6/options'

import { Client, obtainDocumentInformation } from '@/clients/onlyoffice'
import { userPool } from '@/pools'
import { clientFor } from '@/shortcuts'
import { getTestRoot } from '@/test'
import { getPoolItem } from '@/utils'
import { envValues } from '@/values'

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

export const open_change_save_010_setup = async (): Promise<Environment> => {
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })
  const rootInfo = await getTestRoot({
    client: adminClient,
    userLogin: settings.admin.login,
    platform: settings.platform.type,
    resourceName: settings.seed.container.name,
    resourceType: settings.seed.container.type,
    isOwner: false
  })

  const testRoot = [rootInfo.root, rootInfo.path].join('/')

  adminClient.resource.uploadResource({
    root: testRoot,
    resourcePath: settings.docx,
    resourceBytes: docX
  })

  return {
    testRoot
  }
}

export const open_change_save_010 = async ({ testRoot }: Environment): Promise<void> => {
  // pick a user from the pool based on the current VU index
  const user = getPoolItem({ pool: userPool, n: exec.vu.idInTest })
  const userStore = store(user.userLogin)

  // resolve document information once per VU and cache it across iterations:
  // fetches the file's WebDAV resource ID, then calls /app/open to get the
  // OnlyOffice session token, document key, userAuth, and fileInfo
  const documentInformation = await userStore.setOrGet('root', async () => {
    const ocisClient = clientFor(user)

    // GET WebDAV properties to retrieve the oCIS file ID needed by OnlyOffice
    const getResourcePropertiesResponse = await ocisClient.resource.getResourceProperties({
      root: testRoot,
      resourcePath: settings.docx
    })
    sleep(settings.sleep.after_request)

    // extract the oc:fileid property from the WebDAV PROPFIND response
    const [resourceId] = queryXml("$..['oc:fileid']", getResourcePropertiesResponse.body)

    // POST /app/open to obtain OnlyOffice session credentials (token, documentId, userAuth)
    return obtainDocumentInformation({ client: ocisClient, appName: settings.only_office.app_name, resourceId })
  })

  // build a WebSocket client for the OnlyOffice collaborative editing channel
  const ooClient = new Client({
    ...documentInformation,
    url: cleanURL(settings.only_office.wss_url, 'doc', documentInformation.documentId, 'c/?EIO=4&transport=websocket')
  })

  // track WebSocket errors as a custom k6 counter metric
  ooClient.onError((err) => {
    console.error(err?.error)
    ooClientErrors.add(1, { errorType: err?.error || 'unknown' })
  })

  // perform the WebSocket handshake and authenticate with the OnlyOffice server
  await ooClient.establishSession()
  sleep(settings.sleep.after_request)

  // pre-encoded ODF change operations that insert the text "ABC"
  // into the document (base64-encoded binary change packets in the OnlyOffice protocol)
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

  // close the WebSocket connection gracefully
  ooClient.disconnect()
  sleep(settings.sleep.after_iteration)
}

export const open_change_save_010_teardown = ({ testRoot }: Environment): void => {
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })

  const waitForUnlock = () => {
    const { body } = adminClient.resource.getResourceProperties({ root: testRoot, resourcePath: settings.docx })

    if(queryXml("$..['d:activelock']", body).length !== 0){
      sleep(1)
      waitForUnlock()
    }
  }

  waitForUnlock()

  adminClient.resource.deleteResource({ root: testRoot, resourcePath: settings.docx })
}

export const setup = open_change_save_010_setup
export default open_change_save_010
export const teardown = open_change_save_010_teardown
