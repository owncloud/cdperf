import { queryJson, store } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { random } from 'lodash'

import { PoolUser, userPool } from '@/pools'
import { clientFor } from '@/shortcuts'
import { getPoolItem, getPoolItems } from '@/utils'
import { envValues } from '@/values'

export const options: Options = {
  vus: 1,
  iterations: 1,
  insecureSkipTLSVerify: true
}

const settings = {
  ...envValues()
}

export async function setup(): Promise<void> {
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })

  // Resolve the Admin role ID
  const getRolesResponse = adminClient.role.getRoles()
  const [appRoleId] = queryJson("$.bundles[?(@.name === 'admin')].id", getRolesResponse?.body)

  // Resolve the application resource ID
  const listApplicationsResponse = adminClient.application.listApplications()
  const [resourceId] = queryJson("$.value[?(@.displayName === 'ownCloud Infinite Scale')].id", listApplicationsResponse?.body)

  // Assign Admin role to all pool users
  const poolUsers = getPoolItems({ pool: userPool, n: options.vus || 1 })
  await Promise.all(
    poolUsers.map(async (poolUser) => {
      const getUserResponse = adminClient.user.getUser({ userLogin: poolUser.userLogin })
      const [principalId] = queryJson('$.id', getUserResponse?.body)

      if (principalId && appRoleId && resourceId) {
        await adminClient.role.addRoleToUser({ appRoleId, resourceId, principalId })
      }
    })
  )
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

  // Step 3: Resolve the target user's UUID via Graph API
  const getUserResponse = client.user.getUser({ userLogin: targetUser.userLogin })
  const [targetUserId] = queryJson('id', getUserResponse?.body)

  sleep(settings.sleep.after_request)

  // Step 4: Add user to the group
  client.group.addUserToGroup({
    groupIdOrName,
    userIdOrLogin: targetUserId,
    baseUrl: settings.platform.base_url
  })

  sleep(settings.sleep.after_request)

  // Step 5: Delete the group
  client.group.deleteGroup({ groupIdOrName })

  sleep(settings.sleep.after_iteration)
}

export default ldap_group_writes_130
