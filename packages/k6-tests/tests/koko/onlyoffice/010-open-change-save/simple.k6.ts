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

// eslint-disable-next-line no-restricted-globals
const docX = open('/Users/fschade/Downloads/document-server-stress-testing-develop/K6/7.3-and-later/dataset/sample.docx', 'b')

export const options: Options = {
  vus: 1,
  iterations: 1,
  insecureSkipTLSVerify: true
}

const settings = {
  ...envValues(),
  get docx(){
    return ENV('DOCX', [settings.seed.resource.root, 'sample.docx'].join('/'))
  }
}

const ooClientErrors = new Counter('oo_client_errors')

export async function setup(): Promise<void> {
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })
  const testRoot = await getTestRoot({
    client: adminClient,
    userLogin: settings.admin.login,
    platform: settings.platform.type,
    resourceName: settings.seed.container.name,
    resourceType: settings.seed.container.type,
    isOwner: false
  })
  adminClient.resource.uploadResource({
    root: [testRoot.root, testRoot.path].join('/'),
    resourcePath: settings.docx,
    resourceBytes: docX
  })
}

export const open_change_save_010 = async (): Promise<void> => {
  const user = getPoolItem({ pool: userPool, n: exec.vu.idInTest })
  const userStore = store(user.userLogin)
  const documentInformation = await userStore.setOrGet('root', async () => {
    const ocisClient = clientFor(user)
    const testRoot = await getTestRoot({
      client: ocisClient,
      userLogin: user.userLogin,
      platform: settings.platform.type,
      resourceName: settings.seed.container.name,
      resourceType: settings.seed.container.type,
      isOwner: false
    })

    const root = [testRoot.root, testRoot.path].filter(Boolean).join('/')
    const getResourcePropertiesResponse = await ocisClient.resource.getResourceProperties({
      root,
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

  // todo: move into pool
  const changes = JSON.stringify([
    '78;AgAAADEA//8BAPOWPfV/JwAAnwAAABgAAAABAAAAAQAAAAEAAAAMAAAADAAAABwAAAA3AC4AMwAuADMALgA1ADAALgBAAEAAUgBlAHYA',
    '58;AgAAADEAAQABAAoAAAAyAF8ANgAzADUAAAAEAAMAAAAKAAAAMgBfADYAMwA1AACAIAAAAAAAAAAAAA==',
    '98;AgAAADEAAQABAAoAAAAyAF8ANgAzADYAAAAcACcAAAAKAAAAMgBfADYAMwA2AAoAAAAyAF8ANgAzADQAAIAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    '34;CgAAADIAXwA2ADMANgABABwAAQAAAAAAAAAEAAAAAwAAAA==',
    '87;AgAAADEAAQABAAoAAAAyAF8ANgAzADQAAAADAAoAAAAyAF8ANgAzADQAQgAAAAAAAAAAAAAACgAAADIAXwA2ADMANQABAAAACgAAADIAXwA2ADMANgAB',
    '98;AgAAADEAAQABAAoAAAAyAF8ANgAzADcAAAAcACcAAAAKAAAAMgBfADYAMwA3AAoAAAAyAF8ANgAzADQAAIAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAAAAAABAAAAQwAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAEAAAABAAAAcgAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAIAAAABAAAAZQAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAMAAAABAAAAYQAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAQAAAABAAAAdAAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAUAAAABAAAAZQAAAAADAAAA',
    '38;CgAAADIAXwA2ADMANwABABwAAQAAAAYAAAACAAAAIAAAAAMAAAA=',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAcAAAABAAAAUAAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAgAAAABAAAAYQAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAkAAAABAAAAcgAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAoAAAABAAAAYQAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAsAAAABAAAAZwAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAAwAAAABAAAAcgAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAA0AAAABAAAAYQAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAA4AAAABAAAAcAAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAAA8AAAABAAAAaAAAAAADAAAA',
    '39;CgAAADIAXwA2ADMANwABABwAAQAAABAAAAABAAAALgAAAAADAAAA',
    '44;CgAAADIAXwA2ADMANAABAAMAAQAAAAAAAAAKAAAAMgBfADYAMwA3AAAAAAA=',
    '36;AgAAADIAAQACAAEAAAABAAAACgAAADIAXwA2ADMANAAAAAAA'
  ])

  await ooClient.makeChanges({ changes })
  sleep(settings.sleep.after_request)

  ooClient.disconnect()
  sleep(settings.sleep.after_iteration)
}

export async function teardown(): Promise<void> {
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })
  const testRoot = await getTestRoot({
    client: adminClient,
    userLogin: settings.admin.login,
    platform: settings.platform.type,
    resourceName: settings.seed.container.name,
    resourceType: settings.seed.container.type,
    isOwner: false
  })

  adminClient.resource.deleteResource({ root: [testRoot.root, testRoot.path].join('/'), resourcePath: settings.docx })
}

export default open_change_save_010
