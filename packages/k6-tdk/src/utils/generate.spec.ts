import { describe, expect, test, vi } from 'vitest'

import { randomString } from './generate'

vi.mock('https://jslib.k6.io/k6-utils/1.2.0/index.js', () => {
  return {
    randomString: (length, charset) => {
      return [length, charset]
    }
  }
})

describe('randomString', async () => {
  test('the default return string length is 10', async () => {
    expect(randomString()).toMatchObject([10, undefined])
  })

  test('overwrite default string length', async () => {
    expect(randomString(2)).toMatchObject([2, undefined])
  })

  test('overwrite the charset', async () => {
    expect(randomString(2, 'foo')).toMatchObject([2, 'foo'])
    expect(randomString(undefined, 'bar')).toMatchObject([10, 'bar'])
  })
})
