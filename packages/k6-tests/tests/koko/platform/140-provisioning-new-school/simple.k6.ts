import { ENV } from '@ownclouders/k6-tdk/lib/utils'
import { sleep } from 'k6'
import exec from 'k6/execution'
import { Options } from 'k6/options'
import { times } from 'lodash'

import {
  call,
  intFrom,
  odataId,
  oneOf,
  primaryRoleFor,
  provisioningEntries,
  provisioningValues,
  schoolNumberFor,
  shareFrom,
  userClassIndexes,
  UserKind,
  userKindFor
} from '@/provisioning'
import { envValues } from '@/values'

export const options: Options = {
  vus: 1,
  iterations: 1,
  // a school with the default size takes more than an hour, k6 stops iterations after 10 minutes by default
  duration: '7d',
  insecureSkipTLSVerify: true
}

const settings = {
  ...envValues(),
  provisioning: provisioningValues(),
  school: {
    get users() {
      return intFrom({ name: 'TEST_KOKO_PLATFORM_140_USERS_PER_SCHOOL', value: ENV('TEST_KOKO_PLATFORM_140_USERS_PER_SCHOOL', '1000'), min: 1 })
    },
    get classes() {
      return intFrom({ name: 'TEST_KOKO_PLATFORM_140_CLASSES_PER_SCHOOL', value: ENV('TEST_KOKO_PLATFORM_140_CLASSES_PER_SCHOOL', '30'), min: 0 })
    },
    get teacher_share() {
      return shareFrom({ name: 'TEST_KOKO_PLATFORM_140_TEACHER_SHARE', value: ENV('TEST_KOKO_PLATFORM_140_TEACHER_SHARE', '0.08') })
    },
    get no_class_share() {
      return shareFrom({ name: 'TEST_KOKO_PLATFORM_140_NO_CLASS_SHARE', value: ENV('TEST_KOKO_PLATFORM_140_NO_CLASS_SHARE', '0.02') })
    },
    get teacher_classes() {
      return intFrom({ name: 'TEST_KOKO_PLATFORM_140_TEACHER_CLASSES', value: ENV('TEST_KOKO_PLATFORM_140_TEACHER_CLASSES', '3'), min: 1 })
    },
    // members: teachers are class members like students, teachers: teachers are linked with /classes/{id}/teachers/$ref
    get teacher_link() {
      return oneOf({
        name: 'TEST_KOKO_PLATFORM_140_TEACHER_LINK',
        value: ENV('TEST_KOKO_PLATFORM_140_TEACHER_LINK', 'members'),
        allowed: ['members', 'teachers'] as const
      })
    },
    get staff_role() {
      return ENV('TEST_KOKO_PLATFORM_140_STAFF_ROLE', 'lehrer')
    },
    get cleanup() {
      return ENV('TEST_KOKO_PLATFORM_140_CLEANUP', 'false') === 'true'
    }
  }
}

type Environment = {
  runId: string
}

export function setup(): Environment {
  // read every setting once, a broken value fails the run before the first school is created,
  // cleanup is left out, the ramping test sets it in the scenario env and setup does not see that
  const { users, classes, teacher_share, no_class_share, teacher_classes, teacher_link, staff_role } = settings.school
  const school = { users, classes, teacher_share, no_class_share, teacher_classes, teacher_link, staff_role }
  console.info(`provisioning schools with ${JSON.stringify(school)}`)

  if (teacher_share + no_class_share > 1) {
    throw new Error(`TEACHER_SHARE ${teacher_share} and NO_CLASS_SHARE ${no_class_share} add up to more than 1`)
  }

  return {
    runId: String(Date.now())
  }
}

export const provision_new_school_140 = ({ runId }: Environment): void => {
  const baseUrl = settings.provisioning.base_url
  const schoolNumber = schoolNumberFor({ runId, vu: exec.vu.idInTest, iteration: exec.vu.iterationInInstance })
  const schoolRef = encodeURIComponent(schoolNumber)
  const classIds: string[] = []
  const userIds: string[] = []

  const schoolResponse = call({
    method: 'POST',
    path: '/schools',
    body: { displayName: `Load test school ${schoolNumber}`, schoolNumber },
    step: 'create_school',
    expectedStatus: 201
  })

  // without a school every following call fails, skip the rest of this school
  if (schoolResponse.status !== 201) {
    return
  }

  provisioningEntries.add(1, { type: 'school' })
  // test 150 needs the school number of an existing school
  console.info(`provisioning school ${schoolNumber}`)

  times(settings.school.classes, (c) => {
    const classResponse = call({
      method: 'POST',
      path: '/classes',
      body: { displayName: `Class ${c + 1}`, externalId: `${schoolNumber}-c${c}`, classification: 'class' },
      step: 'create_class',
      expectedStatus: 201
    })

    if (classResponse.status !== 201) {
      return
    }

    const classId = classResponse.json('id') as string
    classIds.push(classId)

    call({
      method: 'POST',
      path: `/schools/${schoolRef}/classes/$ref`,
      body: { '@odata.id': odataId({ baseUrl, kind: 'classes', id: classId }) },
      step: 'link_class_to_school',
      expectedStatus: 204
    })

    provisioningEntries.add(1, { type: 'class' })
  })

  times(settings.school.users, (u) => {
    const kind = userKindFor({ index: u, teacherShare: settings.school.teacher_share, noClassShare: settings.school.no_class_share })
    const userName = `${schoolNumber}-u${u}`.toLowerCase()

    const userResponse = call({
      method: 'POST',
      path: '/users',
      body: {
        displayName: `Load test ${kind} ${u + 1}`,
        givenName: 'Load test',
        surname: `${kind} ${u + 1}`,
        onPremisesSamAccountName: userName,
        externalID: `${schoolNumber}-u${u}`,
        identities: [{ issuer: 'cdperf-loadtest', issuerAssignedId: userName }],
        primaryRole: primaryRoleFor({ kind, staffRole: settings.school.staff_role }),
        accountEnabled: true
      },
      step: 'create_user',
      expectedStatus: 200
    })

    // the links need the user id, skip them if the user could not be created
    if (userResponse.status !== 200) {
      return
    }

    const userId = userResponse.json('id') as string
    userIds.push(userId)

    // the connector links the user to the school first and then to its classes, the order is part of the load profile
    call({
      method: 'POST',
      path: `/schools/${schoolRef}/users/$ref`,
      body: { '@odata.id': odataId({ baseUrl, kind: 'users', id: userId }) },
      step: 'link_user_to_school',
      expectedStatus: 204
    })

    const asTeacher = kind === UserKind.teacher && settings.school.teacher_link === 'teachers'

    userClassIndexes({ index: u, kind, classCount: settings.school.classes, teacherClasses: settings.school.teacher_classes }).forEach((c) => {
      // the connector knows the class by its externalId only, it looks up the id for every user
      const lookupResponse = call({
        method: 'GET',
        path: `/classes/${encodeURIComponent(`${schoolNumber}-c${c}`)}`,
        step: 'get_class',
        expectedStatus: 200
      })

      if (lookupResponse.status !== 200) {
        return
      }

      call({
        method: 'POST',
        path: `/classes/${lookupResponse.json('id')}/${asTeacher ? 'teachers' : 'members'}/$ref`,
        body: { '@odata.id': odataId({ baseUrl, kind: 'users', id: userId }) },
        step: asTeacher ? 'link_teacher_to_class' : 'link_user_to_class',
        expectedStatus: 204
      })
    })

    provisioningEntries.add(1, { type: 'user' })
  })

  // the school itself stays, oCIS only deletes schools after their termination date has passed
  if (settings.school.cleanup) {
    userIds.forEach((id) => {
      call({ method: 'DELETE', path: `/users/${id}`, step: 'delete_user', expectedStatus: 204, phase: 'cleanup' })
    })
    classIds.forEach((id) => {
      call({ method: 'DELETE', path: `/classes/${id}`, step: 'delete_class', expectedStatus: 204, phase: 'cleanup' })
    })
  }

  sleep(settings.sleep.after_iteration)
}

export default provision_new_school_140
