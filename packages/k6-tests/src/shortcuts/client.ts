import { Client } from '@ownclouders/k6-tdk/lib/client'
import { httpClientFactory } from '@ownclouders/k6-tdk/lib/utils'
import { CookieJar } from 'k6/http'

import { envValues } from '@/values'

import { authNProviderFor } from './auth'

export const clientFor = (p: { userLogin: string, userPassword: string }): Client => {
  const values = envValues()
  const jar = new CookieJar()
  const authNProvider = authNProviderFor({
    jar,
    userLogin: p.userLogin,
    userPassword: p.userPassword
  })

  const httpClient = httpClientFactory({ authNProvider, baseUrl: values.platform.base_url, params: { jar } })
  return new Client({ httpClient, platform: values.platform.type })
}
