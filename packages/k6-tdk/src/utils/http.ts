import { Params, RefinedParams, RefinedResponse, request, RequestBody, ResponseType } from 'k6/http'
import { merge } from 'lodash-es'

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
    const params = {}

    merge(params, p.params)

    if (p.authn) {
      merge(params, {
        headers: {
          Authorization: p.authn.header
        }
      })
    }

    merge(params, requestParams)

    return request<RT>(method, cleanURL(p.baseUrl, url), body, params)
  }) as Request
}
