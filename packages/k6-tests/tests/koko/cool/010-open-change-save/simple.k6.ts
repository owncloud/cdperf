import { ENV, queryXml, store } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Counter } from 'k6/metrics'
import { Options } from 'k6/options'

import { Client, obtainDocumentInformation } from '@/clients/cool'
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

const coolClientErrors = new Counter('cool_client_errors')

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
  const user = getPoolItem({ pool: userPool, n: exec.vu.idInTest })
  const userStore = store(user.userLogin)
  const documentInformation = await userStore.setOrGet('root', async () => {
    const ocisClient = clientFor(user)

    const getResourcePropertiesResponse = await ocisClient.resource.getResourceProperties({
      root: testRoot,
      resourcePath: settings.docx
    })
    sleep(settings.sleep.after_request)

    const [resourceId] = queryXml("$..['oc:fileid']", getResourcePropertiesResponse.body)
    return obtainDocumentInformation({ client: ocisClient, appName: settings.cool.app_name, resourceId })
  })

  const { app_url } = documentInformation

  const coolClient = new Client({
    ...documentInformation,
    url: app_url
  })

  coolClient.onError((err) => {
    console.error(err?.error)
    coolClientErrors.add(1, { errorType: err?.error || 'unknown' })
  })

  await coolClient.establishSession()
  sleep(settings.sleep.after_request)

  // todo: move into pool
  const changes = [
    'textinput id=0 text=H',
    'textinput id=0 text=e',
    'textinput id=0 text=l',
    'textinput id=0 text=l',
    'textinput id=0 text=o',
    'key type=input char=32 key=0',
    'textinput id=0 text=w',
    'textinput id=0 text=o',
    'textinput id=0 text=r',
    'textinput id=0 text=l',
    'textinput id=0 text=d',
    'key type=input char=33 key=0'
  ]

  await coolClient.makeChanges({ changes })
  sleep(settings.sleep.after_request)

  coolClient.disconnect()
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
