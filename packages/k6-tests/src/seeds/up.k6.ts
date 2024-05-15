import { noop, queryJson } from '@ownclouders/k6-tdk/lib/utils'
import { Permission, ShareType } from '@ownclouders/k6-tdk/lib/values'
import { randomBytes } from 'k6/crypto'
import { Options } from 'k6/options'

import { createCalendar, createCalendarResource } from '@/mock'
import { groupPool, userPool } from '@/pools'
import { clientFor } from '@/shortcuts'
import { createTestRoot } from '@/test'
import { getPoolItems } from '@/utils'
import { envValues, TestRootType } from '@/values'

export const options: Options = {
  vus: 1,
  insecureSkipTLSVerify: true,
  setupTimeout: '1h'
}

export async function setup(): Promise<void> {
  const values = envValues()

  const adminClient = clientFor({ userLogin: values.admin.login, userPassword: values.admin.password })
  const testRoot = await createTestRoot({
    client: adminClient,
    resourceName: values.seed.container.name,
    resourceType: values.seed.container.type,
    userLogin: values.admin.login,
    platform: values.platform.type
  })

  const availableGroups: string[] = []
  const availableUsers: string[] = []

  /**
   * groups
   */
  if (values.seed.groups.create) {
    const poolGroups = getPoolItems({ pool: groupPool, n: values.seed.groups.total })

    await Promise.all(
      poolGroups.map(async ({ groupName }) => {
        const createGroupResponse = adminClient.group.createGroup({ groupName })
        const [groupId] = queryJson('id', createGroupResponse.body)
        const groupIdOrName = groupId || groupName

        availableGroups.push(groupName)

        noop(groupIdOrName)
      })
    )
  }

  /**
   * users
   */
  {
    if (values.seed.users.create) {
      const poolUsers = getPoolItems({ pool: userPool, n: values.seed.users.total })
      const getRolesResponse = adminClient.role.getRoles()
      const [appRoleId] = queryJson("$.bundles[?(@.name === 'spaceadmin')].id", getRolesResponse?.body)

      const listApplicationsResponse = adminClient.application.listApplications()
      const [resourceId] = queryJson("$.value[?(@.displayName === 'ownCloud Infinite Scale')].id", listApplicationsResponse?.body)

      await Promise.all(
        poolUsers.map(async (user) => {
          const createUserResponse = adminClient.user.createUser(user)
          const [principalId] = queryJson('$.id', createUserResponse.body)

          availableUsers.push(principalId)

          await adminClient.user.enableUser(user)
          await adminClient.role.addRoleToUser({ appRoleId, resourceId, principalId })
        })
      )
    }
  }

  if (values.seed.groups.create && values.seed.users.create) {
    const targetGroup = availableGroups.filter(Boolean)[0]
    const targetMembers = availableUsers.filter(Boolean)

    const params = {
      shareResourcePath: testRoot.path,
      shareReceiver: targetGroup
    } as any

    // fixme: check shareResource shortcut
    switch (values.seed.container.type) {
      case TestRootType.space:
        // params.shareType = ShareType.spaceMembershipUser // fixme: check classic and nextCloud
        params.shareType = ShareType.spaceMembershipGroup
        params.shareReceiverPermission = Permission.coOwner
        params.spaceRef = testRoot.root
        break
      case TestRootType.directory:
        // params.shareType = ShareType.user // fixme: check classic and nextCloud
        params.shareType = ShareType.group
        params.shareReceiverPermission = Permission.all
        break
      default:
    }

    await adminClient.share.createShare(params)

    await Promise.all(
      targetMembers.map(async (principalId) => {
        await adminClient.group.addGroupMember({ groupId: targetGroup, userId: principalId })
      })
    )
  }

  /**
   * data
   */
  {
    await adminClient.resource.createResource({
      root: [testRoot.root, testRoot.path].join('/'),
      resourcePath: values.seed.resource.root
    })

    await Promise.all(
      [
        values.seed.resource.small,
        values.seed.resource.medium,
        values.seed.resource.large
      ].map(async (r) => {
        await adminClient.resource.uploadResource({
          root: [testRoot.root, testRoot.path, values.seed.resource.root].join('/'),
          resourcePath: r.name,
          resourceBytes: randomBytes(r.size)
        })
      })
    )
  }

  /**
   * calendar
   */
  {
    const calendar = createCalendar({
      root: values.seed.calendar.root,
      fromYear: values.seed.calendar.from_year,
      toYear: values.seed.calendar.to_year
    })

    await adminClient.resource.createResource({
      root: [testRoot.root, testRoot.path].join('/'),
      resourcePath: calendar.root
    })

    await Promise.all(calendar.y.map(async (y) => {
      await adminClient.resource.createResource({ root: [testRoot.root, testRoot.path].join('/'), resourcePath: y })
    }))

    await Promise.all(calendar.m.map(async (m) => {
      await adminClient.resource.createResource({ root: [testRoot.root, testRoot.path].join('/'), resourcePath: m })
    }))

    await Promise.all(calendar.d.map(async (d) => {
      await adminClient.resource.createResource({ root: [testRoot.root, testRoot.path].join('/'), resourcePath: d })
    }))

    await Promise.all(
      calendar.d.map(async (v) => {
        const calendarResource = createCalendarResource({ v })
        await adminClient.resource.uploadResource({
          root: [testRoot.root, testRoot.path].join('/'),
          resourcePath: calendarResource.resourcePath,
          resourceBytes: calendarResource.resourceContent
        })
      })
    )
  }
}

export default function vu(): void {
}
