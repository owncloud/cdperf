import { queryJson, randomString, store  } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import { randomBytes } from 'k6/crypto'
import exec from 'k6/execution'
import { Options } from 'k6/options'

import { userPool } from '@/pools'
import { clientFor } from '@/shortcuts'
import { getPoolItem } from '@/utils'
import { envValues } from '@/values'

export const options: Options = {
  vus: 1,
  iterations: 1,
  insecureSkipTLSVerify: true
}

const settings = {
  ...envValues()
}

export const create_upload_rename_delete_folder_and_file_040 = async (): Promise<void> => {
  const user = getPoolItem({ pool: userPool, n: exec.vu.idInTest })
  const userStore = store(user.userLogin)

  const client = await userStore.setOrGet('client', async () => {
    return clientFor(user)
  })

  const root = await userStore.setOrGet('root', async () => {
    const getMyDrivesResponse = await client.me.getMyDrives({ params: { $filter: "driveType eq 'personal'" } })
    const [actorRoot = user.userLogin] = queryJson("$.value[?(@.driveType === 'personal')].id", getMyDrivesResponse?.body)
    sleep(settings.sleep.after_request)

    return actorRoot
  })

  const folderNameCreate = [user.userLogin.replace(/[^A-Za-z0-9]/g, ''), randomString(), 'iteration', exec.vu.iterationInInstance + 1].join('-')
  await client.resource.createResource({ root, resourcePath: folderNameCreate })
  sleep(settings.sleep.after_request)

  let resource: { name: string, size: number }
  if (exec.scenario.iterationInTest % 10 === 0) { // 10%
    resource = { ...settings.seed.resource.large }
  } else if (exec.scenario.iterationInTest % 10 <= 3) { // 30%
    resource = { ...settings.seed.resource.medium }
  } else { // 60%
    resource = { ...settings.seed.resource.small }
  }

  await client.resource.uploadResource({
    root: [root, folderNameCreate].join('/'),
    resourcePath: resource.name,
    resourceBytes: randomBytes(resource.size)
  })
  sleep(settings.sleep.after_request)

  const folderNameRename = [folderNameCreate, 'renamed'].join('-')
  await client.resource.moveResource({ root, fromResourcePath: folderNameCreate, toResourcePath: folderNameRename })
  sleep(settings.sleep.after_request)

  await client.resource.deleteResource({ root, resourcePath: folderNameRename })

  sleep(settings.sleep.after_iteration)
}

export default create_upload_rename_delete_folder_and_file_040
