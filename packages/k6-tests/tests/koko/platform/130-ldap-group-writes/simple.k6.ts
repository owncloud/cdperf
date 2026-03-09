import { queryJson } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Options } from 'k6/options'

import { userPool } from '@/pools'
import { clientFor } from '@/shortcuts'
import { getPoolItems } from '@/utils'
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
  // Step 1: Login Admin user and resolve pool user UUIDs
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })

  const addedUsers = new Set<string>()
  const poolUsers = getPoolItems({ pool: userPool, n: options.vus || 1 })

  for (const poolUser of poolUsers) {
    const getUserResponse = adminClient.user.getUser({ userLogin: poolUser.userLogin })
    const [targetUserId] = queryJson('$.id', getUserResponse?.body)

    if (targetUserId) {
      addedUsers.add(targetUserId)
    }

    sleep(settings.sleep.after_request)
  }

  // Step 2: Admin creates a test group
  const groupName = `k6-test-group-${exec.vu.idInTest}-${exec.scenario.iterationInTest}-${Date.now()}`
  const createGroupResponse = adminClient.group.createGroup({ groupName })
  const [groupId] = queryJson('$.id', createGroupResponse.body)
  const groupIdOrName = groupId || groupName

  sleep(settings.sleep.after_request)

  // Step 3: Add each resolved user to the group
  for (const userId of addedUsers) {
    adminClient.group.addUserToGroup({
      groupIdOrName,
      userIdOrLogin: userId,
      baseUrl: settings.platform.base_url
    })

    sleep(settings.sleep.after_request)
  }

  // Step 4: Admin deletes the group
  adminClient.group.deleteGroup({ groupIdOrName })

  sleep(settings.sleep.after_iteration)
}

export default ldap_group_writes_130
