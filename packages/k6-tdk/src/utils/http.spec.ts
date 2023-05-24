import { describe, expect, it, test, vi } from 'vitest'

import { httpClientFactory } from './http'

vi.mock('k6/http', () => {
  return {
    request: (method, url, body, params) => {
      return { method, url, body, params }
    },
    CookieJar: vi.fn()
  }
})

describe('httpClientFactory', async () => {
  test('the standard k6 implementation still works', async () => {
    const httpClient = httpClientFactory({ baseUrl: '' })
    const response = httpClient('POST', 'endpoint', 'body', { tags: { foo: '1' } })

    expect(response).toMatchObject({
      method: 'POST',
      url: '/endpoint',
      body: 'body',
      params: { tags: { foo: '1' } }
    })
  })

  it('extends the request url', async () => {
    const httpClient = httpClientFactory({ baseUrl: 'http://root.org' })
    const response = httpClient('POST', 'endpoint')

    expect(response.url).toBe('http://root.org/endpoint')
  })

  it('adds a authorization header to the request', async () => {
    const httpClient = httpClientFactory({
      baseUrl: 'http://root.org',
      authNProvider: { headers: { Authorization: 'any' } }
    })
    const response = httpClient('POST', 'endpoint') as any

    expect(response.params.headers.Authorization).toBe('any')
  })

  it('mixes the request params', async () => {
    const httpClient = httpClientFactory({ baseUrl: 'http://root.org', params: { tags: { foo: '1' } } })
    const response = httpClient('POST', 'endpoint', undefined, { tags: { bar: '2' } }) as any

    expect(response.params.tags).toMatchObject({ foo: '1', bar: '2' })
  })
})
