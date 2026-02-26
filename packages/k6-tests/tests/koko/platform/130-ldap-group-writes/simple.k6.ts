import { queryJson, store } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { random } from 'lodash'

import { PoolUser, userPool } from '@/pools'
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

export const ldap_group_writes_130 = async (): Promise<void> => {
  const user = getPoolItem({ pool: userPool, n: exec.vu.idInTest })
  const userStore = store(user.userLogin)

  // Step 1: Login user
  const client = await userStore.setOrGet('client', async () => {
    return clientFor(user)
  })

  // Generate unique group name for this iteration
  const groupName = `k6-test-group-${exec.vu.idInTest}-${exec.scenario.iterationInTest}-${Date.now()}`

  // Step 2: Create a group
  const createGroupResponse = client.group.createGroup({ groupName })
  const [groupId] = queryJson('id', createGroupResponse.body)
  const groupIdOrName = groupId || groupName

  sleep(settings.sleep.after_request)

  // Pick a random user from the pool to add to the group
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

  const targetUser = pickUser()

  // Step 3: Add user to the group
  client.group.addUserToGroup({
    groupIdOrName,
    userIdOrLogin: targetUser.userLogin,
    baseUrl: settings.platform.base_url
  })

  sleep(settings.sleep.after_request)

  // Step 4: Delete the group
  client.group.deleteGroup({ groupIdOrName })

  sleep(settings.sleep.after_iteration)
}

export default ldap_group_writes_130
