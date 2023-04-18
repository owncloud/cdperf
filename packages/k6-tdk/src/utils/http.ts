import { Params, RefinedParams, RefinedResponse, request, RequestBody, ResponseType } from 'k6/http'
import { merge, set } from 'lodash-es'

import { Authenticator } from '@/auth'

import { cleanURL } from './url'

export type Request = typeof request

export const requestFactory = (p: {
  baseUrl: string,
  authn?: Authenticator,
  params?: Params
}): Request => {
  return (<RT extends ResponseType | undefined>(
    method: string,
    url: string,
    body?: RequestBody | null,
    requestParams?: RefinedParams<RT> | null
  ): RefinedResponse<RT> => {
    const params: Params = merge({}, p.params)

    if (p.authn) {
      set(params, 'headers.Authorization', p.authn.header)
    }

    if (p.params?.jar) {
      set(params, 'jar', p.params.jar)
    }

    return request<RT>(method, cleanURL(p.baseUrl, url), body, merge(params, requestParams))
  }) as Request
}
