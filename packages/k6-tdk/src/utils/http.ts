import { Params, RefinedParams, RefinedResponse, request, RequestBody, ResponseType } from 'k6/http'
import { get, merge, set } from 'lodash'

import { AuthNHTTPProvider } from '@/auth'

import { cleanURL } from './url'

export type HttpClient = typeof request

export const httpClientFactory = (p: {
  baseUrl: string,
  authNProvider?: AuthNHTTPProvider,
  params?: Params
}): HttpClient => {
  return (<RT extends ResponseType | undefined>(
    method: string,
    url: string,
    body?: RequestBody | null,
    requestParams?: RefinedParams<RT> | null
  ): RefinedResponse<RT> => {
    const outerParams = p.params || {}
    const innerParams = requestParams || {}
    const localParams: RefinedParams<RT> = { headers: {} }

    if (p.authNProvider) {
      merge(localParams.headers, p.authNProvider.headers)
    }

    const params = merge(localParams, outerParams, innerParams)

    // some keys needs to be picked manually because of merge could distort the object, for example .jar, seems to be one of these.
    const manualPickedKeys = ['jar']
    manualPickedKeys.forEach((k) => {
      const outerV = get(outerParams, k)
      if (outerV) {
        set(params, k, outerV)
      }

      const innerV = get(innerParams, k)
      if (innerV) {
        set(params, k, innerV)
      }
    })

    return request<RT>(method, cleanURL(p.baseUrl, url), body, params)
  }) as HttpClient
}
