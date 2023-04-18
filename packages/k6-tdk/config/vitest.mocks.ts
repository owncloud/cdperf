import { vi } from 'vitest'

vi.mock('k6/http', () => {
  return {
    CookieJar: vi.fn()
  }
})

vi.mock('k6/encoding', () => {
  return {}
})

vi.mock('k6', () => {
  return {}
})

vi.mock('https://jslib.k6.io/url/1.0.0/index.js', () => {
  return {
    URLSearchParams: URLSearchParams
  }
})

vi.mock('k6/experimental/timers', () => {
  return {}
})

vi.mock('https://jslib.k6.io/k6-utils/1.2.0/index.js', () => {
  return {
    randomString: vi.fn()
  }
})
