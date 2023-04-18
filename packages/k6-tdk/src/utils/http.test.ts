import { describe, expect, it, test, vi } from 'vitest'

import { requestFactory } from './http';

vi.mock('k6/http', () => {
  return {
    request: (method, url, body, params) => {
      return { method, url, body, params }
    }
  }
})

describe('requestFactory', async () => {
  test('the standard k6 implementation still works', async () => {
    const request = requestFactory({ baseUrl: '' })
    const response = request('POST', 'endpoint', 'body', { tags: { foo: '1' } })

    expect(response).toMatchObject({
      method: 'POST',
      url: '/endpoint',
      body: 'body',
      params: { tags: { foo: '1' } }
    })
  })

  it('extends the request url', async () => {
    const request = requestFactory({ baseUrl: 'http://root.org' })
    const response = request('POST', 'endpoint')

    expect(response.url).toBe('http://root.org/endpoint')
  })

  it('adds a authorization header to the request', async () => {
    const request = requestFactory({ baseUrl: 'http://root.org', authn: { header: 'anyAuth' } })
    const response = request('POST', 'endpoint') as any

    expect(response.params.headers.Authorization).toBe('anyAuth')
  })

  it('mixes the request params', async () => {
    const request = requestFactory({ baseUrl: 'http://root.org', params: { tags: { foo: '1' } } })
    const response = request('POST', 'endpoint', undefined, { tags: { bar: '2' } }) as any

    expect(response.params.tags).toMatchObject({ foo: '1', bar: '2' })
  })
})
