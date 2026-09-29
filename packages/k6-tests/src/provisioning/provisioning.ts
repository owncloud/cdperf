import { ENV } from '@ownclouders/k6-tdk/lib/utils'
import { check, sleep } from 'k6'
import encoding from 'k6/encoding'
import { RefinedResponse, request } from 'k6/http'
import { Counter } from 'k6/metrics'
import { times } from 'lodash'

import { envValues } from '@/values'

export const EDUCATION_PATH = '/graph/v1.0/education'

// golden ratio conjugate, spreads user kinds evenly over the user index (low-discrepancy sequence)
const GOLDEN_RATIO_CONJUGATE = 0.6180339887498949

export const UserKind = {
  student: 'student',
  teacher: 'teacher',
  staff: 'staff'
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type UserKind = (typeof UserKind)[keyof typeof UserKind];

// staff has no class, the connector has no role of its own for them, the role is configurable
export const primaryRoleFor = (p: { kind: UserKind, staffRole: string }): string => {
  return { student: 'schueler', teacher: 'lehrer', staff: p.staffRole }[p.kind]
}

export const provisioningCallErrors = new Counter('provisioning_call_errors')

// one provisioning entry = one school, class, user or update, independent of the number of http requests it needs
export const provisioningEntries = new Counter('provisioning_entries')

export const provisioningValues = () => {
  return {
    get base_url() {
      return ENV('PROVISIONING_BASE_URL', ENV('PLATFORM_BASE_URL', 'https://localhost:9200'))
    },
    get token() {
      const v = ENV('PROVISIONING_TOKEN', 'none')
      return v === 'none' ? undefined : v
    }
  }
}

export const authHeader = (p: { token?: string, login: string, password: string }): string => {
  if (p.token) {
    return `Bearer ${p.token.replace(/^Bearer\s+/i, '')}`
  }

  return `Basic ${encoding.b64encode(`${p.login}:${p.password}`)}`
}

export const odataId = (p: { baseUrl: string, kind: 'users' | 'classes' | 'schools', id: string }): string => {
  return `${p.baseUrl}${EDUCATION_PATH}/${p.kind}/${p.id}`
}

export const schoolNumberFor = (p: { runId: string, vu: number, iteration: number }): string => {
  return ['LOADTEST', p.runId, p.vu, p.iteration].join('-')
}

export const userKindFor = (p: { index: number, teacherShare: number, noClassShare: number }): UserKind => {
  const position = (p.index * GOLDEN_RATIO_CONJUGATE) % 1

  if (position < p.noClassShare) {
    return UserKind.staff
  }

  if (position < p.noClassShare + p.teacherShare) {
    return UserKind.teacher
  }

  return UserKind.student
}

export const userClassIndexes = (p: {
  index: number,
  kind: UserKind,
  classCount: number,
  teacherClasses: number
}): number[] => {
  if (p.kind === UserKind.staff || p.classCount < 1) {
    return []
  }

  const total = p.kind === UserKind.teacher ? Math.min(p.teacherClasses, p.classCount) : 1
  return times(total, (n) => {
    return (p.index + n) % p.classCount
  })
}

export const roundRobin = <T>(items: T[], iteration: number): T => {
  return items[iteration % items.length]
}

// the first pass over all users disables them, the next pass enables them again, and so on
export const accountEnabledFor = (p: { iteration: number, total: number }): boolean => {
  return Math.floor(p.iteration / p.total) % 2 === 1
}

// oCIS returns a bare array for school users, school classes and class members, other lists are wrapped in value
export const idsFrom = (body: unknown): string[] => {
  const list = Array.isArray(body) ? body : (body as { value?: unknown } | undefined)?.value

  if (!Array.isArray(list)) {
    throw new Error(`expected a list, got ${JSON.stringify(body)}`)
  }

  return (list as { id: string }[]).map(({ id }) => {
    return id
  })
}

// parseInt and parseFloat turn typos into NaN or silently cut them off, the test would then run with a broken school
export const intFrom = (p: { name: string, value: string, min: number, max?: number }): number => {
  const value = p.value.trim() === '' ? NaN : Number(p.value)

  if (!Number.isInteger(value) || value < p.min || (p.max !== undefined && value > p.max)) {
    throw new Error(`invalid ${p.name} ${p.value}, expected a whole number from ${p.min}${p.max === undefined ? '' : ` to ${p.max}`}`)
  }

  return value
}

export const shareFrom = (p: { name: string, value: string }): number => {
  const value = p.value.trim() === '' ? NaN : Number(p.value)

  if (Number.isNaN(value) || value < 0 || value > 1) {
    throw new Error(`invalid ${p.name} ${p.value}, expected a share from 0 to 1`)
  }

  return value
}

export const oneOf = <T extends string>(p: { name: string, value: string, allowed: readonly T[] }): T => {
  if (!(p.allowed as readonly string[]).includes(p.value)) {
    throw new Error(`invalid ${p.name} ${p.value}, expected one of ${p.allowed.join(', ')}`)
  }

  return p.value as T
}

// arrival rates are configured per second, k6 only takes whole numbers, a per minute rate keeps fractions like 0.5/s
export const perMinute = (rate: string): number => {
  const value = parseFloat(rate)

  if (Number.isNaN(value) || value < 0) {
    throw new Error(`invalid rate ${rate}, expected updates per second`)
  }

  return Math.round(value * 60)
}

export const call = (p: {
  method: string,
  path: string,
  body?: Record<string, unknown>,
  step: string,
  expectedStatus: number,
  phase?: string,
  pause?: boolean
}): RefinedResponse<'text'> => {
  const values = envValues()
  const provisioning = provisioningValues()
  const phase = p.phase || 'provision'

  const response = request(
    p.method,
    `${provisioning.base_url}${EDUCATION_PATH}${p.path}`,
    p.body ? JSON.stringify(p.body) : null,
    {
      headers: {
        Authorization: authHeader({ token: provisioning.token, login: values.admin.login, password: values.admin.password }),
        'Content-Type': 'application/json'
      },
      // name groups the per-object urls into one entry per step
      tags: { name: p.step, step: p.step, phase }
    }
  ) as RefinedResponse<'text'>

  const ok = check(response, {
    [`provisioning -> ${p.step} - status`]: ({ status }) => {
      return status === p.expectedStatus
    }
  }, { step: p.step, phase })

  if (!ok) {
    provisioningCallErrors.add(1, { step: p.step, phase })
  }

  if (p.pause !== false) {
    sleep(values.sleep.after_request)
  }

  return response
}
