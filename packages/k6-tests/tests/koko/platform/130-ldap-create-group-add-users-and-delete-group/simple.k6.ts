import { ENV, queryJson } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Options } from 'k6/options'

import { clientFor } from '@/shortcuts'
import { envValues } from '@/values'

export const options: Options = {
  vus: 1,
  iterations: 1,
  insecureSkipTLSVerify: true
}

const settings = {
  ...envValues(),
  get usersCountPerGroup() {
    return parseInt(ENV('USERS_COUNT_PER_GROUP', '0'), 10)
  }
}

export const ldap_create_group_add_users_and_delete_group_130 = async (): Promise<void> => {
  // Step 1: Login Admin user and load existing users
  const adminClient = clientFor({ userLogin: settings.admin.login, userPassword: settings.admin.password })

  const getUsersResponse = adminClient.user.getUsers()
  let userIds: string[] = queryJson('$.value[*].id', getUsersResponse?.body).filter(Boolean)

  if (settings.usersCountPerGroup > 0) {
    for (let i = userIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [userIds[i], userIds[j]] = [userIds[j], userIds[i]]
    }
    userIds = userIds.slice(0, settings.usersCountPerGroup)
  }

  const addedUsers = new Set<string>(userIds)

  sleep(settings.sleep.after_request)

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

export default ldap_create_group_add_users_and_delete_group_130
