import { store } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Options } from 'k6/options'

import { userPool } from '@/pools'
import { clientFor } from '@/shortcuts'
import { getTestRoot } from '@/test'
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

export const download_050 = async (): Promise<void> => {
  const user = getPoolItem({ pool: userPool, n: exec.vu.idInTest })
  const userStore = store(user.userLogin)

  const client = await userStore.setOrGet('client', async () => {
    return clientFor(user)
  })

  const root = await userStore.setOrGet('root', async () => {
    const testRoot = await getTestRoot({
      client,
      userLogin: user.userLogin,
      platform: settings.platform.type,
      resourceName: settings.seed.container.name,
      resourceType: settings.seed.container.type,
      isOwner: false
    })
    sleep(settings.sleep.after_request)

    return [testRoot.root, testRoot.path].filter(Boolean).join('/')
  })

  let resource: { name: string, size: number }
  if (exec.scenario.iterationInTest % 10 === 0) { // 10%
    resource = { ...settings.seed.resource.large }
  } else if (exec.scenario.iterationInTest % 10 <= 3) { // 30%
    resource = { ...settings.seed.resource.medium }
  } else { // 60%
    resource = { ...settings.seed.resource.small }
  }

  await client.resource.downloadResource({ root, resourcePath: [settings.seed.resource.root, resource.name].join('/') })

  sleep(settings.sleep.after_iteration)
}

export default download_050
