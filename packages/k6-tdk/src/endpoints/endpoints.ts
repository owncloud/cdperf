import { RefinedParams, RefinedResponse, ResponseType } from 'k6/http'

import { HttpClient } from '@/utils'

export type Endpoint<
  P extends Record<string, unknown>,
  RT extends ResponseType,
  O extends Record<string, unknown> = {}
> = (httpClient: HttpClient, params: P, options?: { k6?: RefinedParams<RT> } & O) => RefinedResponse<RT>;
