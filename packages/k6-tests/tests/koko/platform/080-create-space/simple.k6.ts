import { queryJson, store } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
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

export const create_space_080 = async (): Promise<void> => {
  const user = getPoolItem({ pool: userPool, n: exec.vu.idInTest })
  const userStore = store(user.userLogin)

  const client = await userStore.setOrGet('client', async () => {
    return clientFor(user)
  })

  const driveCreateResponse = await client.drive.createDrive({
    driveName: [user.userLogin.replace(/[^A-Za-z0-9]/g, ''), 'iteration', exec.vu.iterationInInstance + 1].join('-')
  })
  const [driveId] = queryJson('$.id', driveCreateResponse?.body)
  sleep(settings.sleep.after_request)

  await client.drive.deactivateDrive({ driveId })
  sleep(settings.sleep.after_request)

  await client.drive.deleteDrive({ driveId })

  sleep(settings.sleep.after_iteration)
}

export default create_space_080
