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

export const login_010 = async (): Promise<void> => {
  const user = getPoolItem({ n: exec.vu.idInTest, pool: userPool })
  // needs new client in every iteration, defined in the concept!
  const client = clientFor(user)
  await client.me.getMyDrives()

  sleep(settings.sleep.after_iteration)
}

export default login_010
