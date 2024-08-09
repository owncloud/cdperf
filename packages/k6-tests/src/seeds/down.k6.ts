import { Options } from 'k6/options'

import { groupPool, userPool } from '@/pools'
import { clientFor } from '@/shortcuts'
import { deleteTestRoot } from '@/test'
import { getPoolItems } from '@/utils'
import { envValues } from '@/values'

export const options: Options = {
  vus: 1,
  insecureSkipTLSVerify: true,
  setupTimeout: '1h'
}

export async function setup(): Promise<void> {
  const values = envValues()
  const adminClient = clientFor({ userLogin: values.admin.login, userPassword: values.admin.password })

  if (values.seed.groups.delete) {
    const getGroupsResponse = await adminClient.group.getGroups()
    const availableGroups = JSON.parse(getGroupsResponse!.body).value
    const consideredGroups = groupPool.map((pg) => {
      const group: {
        id: string,
        displayName: string
      } = availableGroups.find(({ displayName }) => {
        return pg.groupName === displayName
      })

      return group ? { groupId: group.id, groupName: group.id } : undefined
    }).filter((maybeGroup): maybeGroup is { groupId: string, groupName: string } => {
      return !!maybeGroup
    })

    await Promise.all(
      consideredGroups.map(async ({ groupId, groupName }) => {
        await adminClient.group.deleteGroup({ groupIdOrName: groupId || groupName })
      })
    )
  }
  await deleteTestRoot({
    client: adminClient,
    resourceName: values.seed.container.name,
    resourceType: values.seed.container.type,
    userLogin: values.admin.login,
    platform: values.platform.type
  })

  if (values.seed.users.delete) {
    const poolUsers = getPoolItems({ pool: userPool, n: values.seed.users.total })
    await Promise.all(
      poolUsers.map(async (user) => {
        await adminClient.user.deleteUser(user)
      })
    )
  }
}

export default function noop(): void {
}
