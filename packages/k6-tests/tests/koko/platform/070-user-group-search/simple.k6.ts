import { store } from '@ownclouders/k6-tdk/lib/utils'
import { ItemType } from '@ownclouders/k6-tdk/lib/values'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { random, sample } from 'lodash'

import { groupPool, PoolUser, userPool } from '@/pools'
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

export const user_group_search_070 = async (): Promise<void> =>{
  const user = getPoolItem({ pool: userPool, n: exec.vu.idInTest })
  const userStore = store(user.userLogin)

  const client = await userStore.setOrGet('client', async () => {
    return clientFor(user)
  })

  const pickUser = (): PoolUser => {
    const pickedUser = getPoolItem({ pool: userPool, n: random(1, Math.min(options.vus || 1, userPool.length)) })
    if (options.vus === 1) {
      return pickedUser
    }

    if (pickedUser.userLogin === user.userLogin) {
      return pickUser()
    }

    return pickedUser
  }

  let searchQuery = ''
  if (exec.scenario.iterationInTest % 2) { // 50%
    searchQuery = pickUser().userLogin
  } else { // 50%
    searchQuery = sample(groupPool)!.groupName
  }

  await client.search.searchForSharees({ searchQuery, searchItemType: ItemType.folder })
  sleep(settings.sleep.after_iteration)
}

export default user_group_search_070
