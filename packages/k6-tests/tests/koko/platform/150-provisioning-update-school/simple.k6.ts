import { ENV } from '@ownclouders/k6-tdk/lib/utils'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { chunk } from 'lodash'

import {
  accountEnabledFor,
  call,
  idsFrom,
  intFrom,
  odataId,
  provisioningEntries,
  provisioningValues,
  roundRobin
} from '@/provisioning'

export const options: Options = {
  vus: 1,
  iterations: 1,
  insecureSkipTLSVerify: true,
  setupTimeout: ENV('TEST_KOKO_PLATFORM_150_SETUP_TIMEOUT', '10m'),
  // teardown sends about 1.060 unpaced requests for a school with 1000 users and 30 classes,
  // at 300 ms per request through a proxy that is about 5.3 minutes, raise it for bigger schools or slower links
  teardownTimeout: ENV('TEST_KOKO_PLATFORM_150_TEARDOWN_TIMEOUT', '30m')
}

const settings = {
  provisioning: provisioningValues(),
  get reference_school() {
    return ENV('TEST_KOKO_PLATFORM_150_REFERENCE_SCHOOL')
  },
  bulk: {
    get enabled() {
      return ENV('TEST_KOKO_PLATFORM_150_BULK_ENABLED', 'false') === 'true'
    },
    // oCIS takes at most 20 members@odata.bind entries per request
    get size() {
      return intFrom({ name: 'TEST_KOKO_PLATFORM_150_BULK_SIZE', value: ENV('TEST_KOKO_PLATFORM_150_BULK_SIZE', '20'), min: 1, max: 20 })
    }
  },
  get teardown_enable_users() {
    return ENV('TEST_KOKO_PLATFORM_150_TEARDOWN_ENABLE_USERS', 'true') === 'true'
  },
  get teardown_restore_memberships() {
    return ENV('TEST_KOKO_PLATFORM_150_TEARDOWN_RESTORE_MEMBERSHIPS', 'true') === 'true'
  }
}

type Membership = {
  classId: string,
  userId: string
}

type ClassMembers = {
  classId: string,
  userIds: string[]
}

type Environment = {
  userIds: string[],
  classIds: string[],
  // all members of all classes as read in setup, teardown restores them
  classMembers: ClassMembers[],
  // memberships for change_class_membership_150
  memberships: Membership[],
  // classes and their members for bulk_class_membership_150
  bulkClasses: ClassMembers[]
}

const listIds = (path: string): string[] => {
  const response = call({ method: 'GET', path, step: 'setup_list', expectedStatus: 200, phase: 'setup', pause: false })

  if (response.status !== 200) {
    throw new Error(`reading ${path} failed with status ${response.status}`)
  }

  return idsFrom(response.json())
}

export function setup(): Environment {
  // a broken bulk size fails the run here and not in teardown
  const bulkSize = settings.bulk.size
  const schoolRef = encodeURIComponent(settings.reference_school)
  const userIds = listIds(`/schools/${schoolRef}/users`)
  const classIds = listIds(`/schools/${schoolRef}/classes`)

  if (!userIds.length || !classIds.length) {
    throw new Error(`reference school ${settings.reference_school} needs users and classes`)
  }

  // bulk gets every second class, with a single class it would get none and silently do nothing
  if (settings.bulk.enabled && classIds.length < 2) {
    throw new Error(`bulk needs a reference school with at least 2 classes, ${settings.reference_school} has ${classIds.length}`)
  }

  console.info(`updating school ${settings.reference_school} with ${userIds.length} users, ${classIds.length} classes, bulk size ${bulkSize}`)

  const classMembers = classIds.map((classId) => {
    return { classId, userIds: listIds(`/classes/${classId}/members`) }
  })

  // both membership scenarios remove and re-add members, give each its own classes so they never touch the same membership
  const bulkClasses = settings.bulk.enabled ? classMembers.filter((_, i) => {
    return i % 2 === 1
  }) : []
  const memberships = classMembers.filter((m) => {
    return !bulkClasses.includes(m)
  }).flatMap(({ classId, userIds: classUserIds }) => {
    return classUserIds.map((userId) => {
      return { classId, userId }
    })
  })

  return { userIds, classIds, classMembers, memberships, bulkClasses }
}

export const update_user_attribute_150 = ({ userIds }: Environment): void => {
  const iteration = exec.scenario.iterationInTest
  const userId = roundRobin(userIds, iteration)

  call({
    method: 'PATCH',
    path: `/users/${userId}`,
    body: { givenName: 'Load test', surname: `updated ${iteration}` },
    step: 'update_user_attribute',
    expectedStatus: 200
  })

  provisioningEntries.add(1, { type: 'update' })
}

export const update_user_account_enabled_150 = ({ userIds }: Environment): void => {
  const iteration = exec.scenario.iterationInTest
  const userId = roundRobin(userIds, iteration)

  call({
    method: 'PATCH',
    path: `/users/${userId}`,
    body: { accountEnabled: accountEnabledFor({ iteration, total: userIds.length }) },
    step: 'update_user_account_enabled',
    expectedStatus: 200
  })

  provisioningEntries.add(1, { type: 'update' })
}

export const rename_class_150 = ({ classIds }: Environment): void => {
  const iteration = exec.scenario.iterationInTest
  const classId = roundRobin(classIds, iteration)

  call({
    method: 'PATCH',
    path: `/classes/${classId}`,
    body: { displayName: `Load test class ${classIds.indexOf(classId) + 1} rev ${iteration}` },
    step: 'rename_class',
    // oCIS PatchEducationClass answers 204 today, it carries a TODO to answer 200 with the class unless prefer=minimal is sent,
    // update this once that lands, otherwise every rename counts as a provisioning error
    expectedStatus: 204
  })

  provisioningEntries.add(1, { type: 'update' })
}

// removes a member and adds it again, the school looks the same afterwards
export const change_class_membership_150 = ({ memberships }: Environment): void => {
  if (!memberships.length) {
    return
  }

  const { classId, userId } = roundRobin(memberships, exec.scenario.iterationInTest)

  call({
    method: 'DELETE',
    path: `/classes/${classId}/members/${userId}/$ref`,
    step: 'remove_class_member',
    expectedStatus: 204
  })

  call({
    method: 'POST',
    path: `/classes/${classId}/members/$ref`,
    body: { '@odata.id': odataId({ baseUrl: settings.provisioning.base_url, kind: 'users', id: userId }) },
    step: 'add_class_member',
    expectedStatus: 204
  })

  provisioningEntries.add(2, { type: 'update' })
}

// removes up to BULK_SIZE members one by one, then adds them back in one PATCH request.
// only the PATCH is measured, the DELETEs are tagged phase:prepare and are not part of any threshold,
// with the defaults that is 20 hidden requests per iteration, run bulk as its own comparison run (see simple.md)
export const bulk_class_membership_150 = ({ bulkClasses }: Environment): void => {
  if (!bulkClasses.length) {
    return
  }

  const { classId, userIds } = roundRobin(bulkClasses, exec.scenario.iterationInTest)
  const batch = userIds.slice(0, settings.bulk.size)

  if (!batch.length) {
    return
  }

  batch.forEach((userId) => {
    call({
      method: 'DELETE',
      path: `/classes/${classId}/members/${userId}/$ref`,
      step: 'bulk_remove_class_member',
      expectedStatus: 204,
      phase: 'prepare',
      pause: false
    })
  })

  call({
    method: 'PATCH',
    path: `/classes/${classId}`,
    body: {
      'members@odata.bind': batch.map((userId) => {
        return odataId({ baseUrl: settings.provisioning.base_url, kind: 'users', id: userId })
      })
    },
    step: 'bulk_add_class_members',
    expectedStatus: 204
  })

  // one entry per member, tagged bulk so it can be told apart from the single updates
  provisioningEntries.add(batch.length, { type: 'bulk' })
}

// leaves the reference school usable, every user is enabled again and
// memberships lost in failed or interrupted membership updates are added again, oCIS skips existing members
export function teardown({ userIds, classMembers }: Environment): void {
  if (settings.teardown_restore_memberships) {
    classMembers.forEach(({ classId, userIds: classUserIds }) => {
      chunk(classUserIds, settings.bulk.size).forEach((batch) => {
        call({
          method: 'PATCH',
          path: `/classes/${classId}`,
          body: {
            'members@odata.bind': batch.map((userId) => {
              return odataId({ baseUrl: settings.provisioning.base_url, kind: 'users', id: userId })
            })
          },
          step: 'teardown_restore_class_members',
          expectedStatus: 204,
          phase: 'teardown',
          pause: false
        })
      })
    })
  }

  if (!settings.teardown_enable_users) {
    return
  }

  userIds.forEach((userId) => {
    call({
      method: 'PATCH',
      path: `/users/${userId}`,
      body: { accountEnabled: true },
      step: 'teardown_enable_user',
      expectedStatus: 200,
      phase: 'teardown',
      pause: false
    })
  })
}

export const update_school_150 = (data: Environment): void => {
  update_user_attribute_150(data)
  update_user_account_enabled_150(data)
  rename_class_150(data)
  change_class_membership_150(data)

  if (settings.bulk.enabled) {
    bulk_class_membership_150(data)
  }
}

export default update_school_150
