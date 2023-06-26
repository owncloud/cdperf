import { Checkers } from 'k6'
import { describe, expect, it, test, vi } from 'vitest'

import { check, group } from './k6'

vi.mock('k6', () => {
  return {
    group: <RT>(name: string, fn: () => RT) => {
      return fn()
    },
    check: (val: unknown, sets: Checkers<unknown>, tags?: object) => {
      Object.keys(sets).forEach((s) => {
        sets[s]({ val, tags })
      })

      return { val, sets, tags }
    }
  }
})

describe('group', async () => {
  test('the standard k6 implementation still works', async () => {
    group('foo', () => {
      expect('called').toBeTruthy()
    })
  })

  it('extends the name further down', async () => {
    group('foo', (name) => {
      expect(name).toBe('foo')
    })
  })
})

describe('check', async () => {
  test('the standard k6 implementation still works', async () => {
    const sets = {
      foo: vi.fn(),
      bar: vi.fn()
    }
    const options = { val: 'a', tags: { b: 'c' } }
    check(options, sets)

    expect(sets.foo).toBeCalledWith(options)
    expect(sets.bar).toBeCalledWith(options)
  })

  it('marks skipped sets as skipped and returns a truthy value', async () => {
    const sets = {
      foo: vi.fn(() => {
        return false
      })
    }
    const result = check({ skip: true, val: 1 }, sets) as any

    expect(sets.foo).toBeCalledTimes(0)
    expect(Object.keys(result.sets)).toHaveLength(1)
    Object.keys(result.sets).forEach((k) => {
      expect(k).toBe('foo -- (SKIPPED)')
      expect(result.sets[k]()).toBeTruthy()
    })
  })
})
