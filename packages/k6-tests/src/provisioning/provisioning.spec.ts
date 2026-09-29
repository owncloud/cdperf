import { check, sleep } from 'k6'
import { request } from 'k6/http'
import { describe, expect, test, vi } from 'vitest'

import {
  accountEnabledFor,
  authHeader,
  call,
  idsFrom,
  intFrom,
  odataId,
  oneOf,
  perMinute,
  primaryRoleFor,
  provisioningCallErrors,
  roundRobin,
  schoolNumberFor,
  shareFrom,
  userClassIndexes,
  userKindFor
} from './provisioning'

vi.mock('k6', () => {
  return {
    check: vi.fn(),
    sleep: vi.fn()
  }
})

vi.mock('k6/http', () => {
  return {
    request: vi.fn()
  }
})

vi.mock('k6/metrics', () => {
  return {
    Counter: vi.fn(() => {
      return { add: vi.fn() }
    })
  }
})

vi.mock('k6/encoding', () => {
  return {
    default: {
      b64encode: (v: string) => {
        return Buffer.from(v).toString('base64')
      }
    }
  }
})

describe('authHeader', () => {
  test('uses the token as bearer token', () => {
    expect(authHeader({ token: 'secret', login: 'admin', password: 'admin' })).toBe('Bearer secret')
  })

  test('does not double the bearer prefix when the token already has one', () => {
    expect(authHeader({ token: 'Bearer secret', login: 'admin', password: 'admin' })).toBe('Bearer secret')
  })

  test('falls back to basic auth without a token', () => {
    expect(authHeader({ login: 'admin', password: 'admin' })).toBe(`Basic ${Buffer.from('admin:admin').toString('base64')}`)
  })
})

test('odataId points to the education resource', () => {
  expect(odataId({ baseUrl: 'https://drive.example', kind: 'users', id: 'u-1' }))
    .toBe('https://drive.example/graph/v1.0/education/users/u-1')
})

test('schoolNumberFor is unique per run, vu and iteration', () => {
  expect(schoolNumberFor({ runId: '1700000000', vu: 3, iteration: 7 })).toBe('LOADTEST-1700000000-3-7')
})

describe('userKindFor', () => {
  const shares = { teacherShare: 0.08, noClassShare: 0.02 }
  const kinds = Array.from({ length: 1000 }, (_, index) => {
    return userKindFor({ index, ...shares })
  })
  const count = (kind: string) => {
    return kinds.filter((k) => {
      return k === kind
    }).length
  }

  test('matches the configured shares', () => {
    expect(Math.abs(count('staff') - 20)).toBeLessThanOrEqual(2)
    expect(Math.abs(count('teacher') - 80)).toBeLessThanOrEqual(2)
    expect(count('student') + count('teacher') + count('staff')).toBe(1000)
  })

  test('spreads teachers across the whole school', () => {
    expect(kinds.slice(0, 100)).toContain('teacher')
    expect(kinds.slice(900)).toContain('teacher')
  })

  test('is deterministic', () => {
    expect(userKindFor({ index: 42, ...shares })).toBe(kinds[42])
  })

  test('only students when shares are zero', () => {
    expect(userKindFor({ index: 5, teacherShare: 0, noClassShare: 0 })).toBe('student')
  })
})

describe('userClassIndexes', () => {
  test('student is in one class, round-robin by index', () => {
    expect(userClassIndexes({ index: 31, kind: 'student', classCount: 30, teacherClasses: 3 })).toEqual([1])
  })

  test('teacher is in consecutive classes, wrapping around', () => {
    expect(userClassIndexes({ index: 29, kind: 'teacher', classCount: 30, teacherClasses: 3 })).toEqual([29, 0, 1])
  })

  test('teacher never gets more classes than exist', () => {
    expect(userClassIndexes({ index: 0, kind: 'teacher', classCount: 2, teacherClasses: 3 })).toEqual([0, 1])
  })

  test('staff has no class', () => {
    expect(userClassIndexes({ index: 4, kind: 'staff', classCount: 30, teacherClasses: 3 })).toEqual([])
  })

  test('nobody has a class when the school has none', () => {
    expect(userClassIndexes({ index: 4, kind: 'student', classCount: 0, teacherClasses: 3 })).toEqual([])
  })
})

test('roundRobin walks through all items and starts over', () => {
  const items = ['a', 'b', 'c']
  expect([0, 1, 2, 3, 4].map((iteration) => {
    return roundRobin(items, iteration)
  })).toEqual(['a', 'b', 'c', 'a', 'b'])
})

test('accountEnabledFor disables every user on the first pass and re-enables them on the next', () => {
  expect([0, 1, 2, 3, 4, 5, 6].map((iteration) => {
    return accountEnabledFor({ iteration, total: 3 })
  })).toEqual([false, false, false, true, true, true, false])
})

describe('idsFrom', () => {
  test('reads a bare array, as oCIS returns for school users, school classes and class members', () => {
    expect(idsFrom([{ id: 'a' }, { id: 'b' }])).toEqual(['a', 'b'])
  })

  test('reads an odata value list', () => {
    expect(idsFrom({ value: [{ id: 'a' }] })).toEqual(['a'])
  })

  test('throws on anything else', () => {
    expect(() => {
      return idsFrom({ error: 'nope' })
    }).toThrow()
  })
})

describe('primaryRoleFor', () => {
  test('students are schueler and teachers are lehrer', () => {
    expect(primaryRoleFor({ kind: 'student', staffRole: 'verwaltung' })).toBe('schueler')
    expect(primaryRoleFor({ kind: 'teacher', staffRole: 'verwaltung' })).toBe('lehrer')
  })

  test('staff gets the configured role', () => {
    expect(primaryRoleFor({ kind: 'staff', staffRole: 'verwaltung' })).toBe('verwaltung')
  })
})

describe('intFrom', () => {
  test('reads a whole number', () => {
    expect(intFrom({ name: 'USERS', value: '1000', min: 1 })).toBe(1000)
  })

  test('throws with the env name on anything that is not a whole number', () => {
    ['abc', '12abc', '1.5', ''].forEach((value) => {
      expect(() => {
        return intFrom({ name: 'USERS', value, min: 1 })
      }).toThrow(/USERS/)
    })
  })

  test('throws outside of min and max', () => {
    expect(() => {
      return intFrom({ name: 'USERS', value: '0', min: 1 })
    }).toThrow(/USERS/)
    expect(() => {
      return intFrom({ name: 'SIZE', value: '21', min: 1, max: 20 })
    }).toThrow(/SIZE/)
  })
})

describe('shareFrom', () => {
  test('reads a share between 0 and 1', () => {
    expect(shareFrom({ name: 'SHARE', value: '0.08' })).toBe(0.08)
    expect(shareFrom({ name: 'SHARE', value: '0' })).toBe(0)
  })

  test('throws with the env name on anything else', () => {
    ['1.5', '-0.1', 'much'].forEach((value) => {
      expect(() => {
        return shareFrom({ name: 'SHARE', value })
      }).toThrow(/SHARE/)
    })
  })
})

describe('oneOf', () => {
  test('returns an allowed value', () => {
    expect(oneOf({ name: 'LINK', value: 'teachers', allowed: ['members', 'teachers'] })).toBe('teachers')
  })

  test('throws with the env name on any other value', () => {
    expect(() => {
      return oneOf({ name: 'LINK', value: 'owners', allowed: ['members', 'teachers'] })
    }).toThrow(/LINK/)
  })
})

describe('perMinute', () => {
  test('converts a per second rate to a per minute rate, fractions included', () => {
    expect(perMinute('0.5')).toBe(30)
    expect(perMinute('2')).toBe(120)
  })

  test('throws on a rate that is not a number', () => {
    expect(() => {
      return perMinute('fast')
    }).toThrow()
  })
})

describe('call', () => {
  const respond = (status: number) => {
    vi.mocked(request).mockReturnValue({ status } as never)
    vi.mocked(check).mockImplementation((r, sets) => {
      return Object.values(sets as Record<string, (v: unknown) => boolean>).every((fn) => {
        return fn(r)
      })
    })
  }

  test('tags the check with step and phase so thresholds can filter by phase', () => {
    respond(204)
    call({ method: 'DELETE', path: '/users/u-1', step: 'delete_user', expectedStatus: 204, phase: 'cleanup' })

    expect(vi.mocked(check).mock.calls[0][2]).toEqual({ step: 'delete_user', phase: 'cleanup' })
    expect(vi.mocked(request).mock.calls[0][3]).toMatchObject({ tags: { name: 'delete_user', step: 'delete_user', phase: 'cleanup' } })
  })

  test('counts an unexpected status as a provisioning error', () => {
    respond(500)
    call({ method: 'GET', path: '/classes/c-1', step: 'get_class', expectedStatus: 200 })

    expect(provisioningCallErrors.add).toHaveBeenCalledWith(1, { step: 'get_class', phase: 'provision' })
  })

  test('pauses after the request unless pause is false', () => {
    respond(200)
    call({ method: 'GET', path: '/classes/c-1', step: 'get_class', expectedStatus: 200 })
    call({ method: 'GET', path: '/classes/c-1', step: 'get_class', expectedStatus: 200, pause: false })

    expect(sleep).toHaveBeenCalledTimes(1)
  })
})
