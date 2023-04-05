import http, { Params, RefinedParams, RefinedResponse, RequestBody, ResponseType } from 'k6/http';
import { merge } from 'lodash-es';

import { Authenticator } from '@/auth';

import { cleanURL } from './url';

export type RequestMethod = 'GET' | 'MKCOL' | 'PROPFIND' | 'DELETE' | 'MOVE' | 'PUT' | 'POST' | 'REPORT' | 'SEARCH';

export type Request = <RT extends ResponseType | undefined>(
  method: RequestMethod,
  url: string,
  body?: RequestBody | null,
  params?: RefinedParams<RT> | null,
) => RefinedResponse<RT>;

export const requestFactory = (base: string, authenticator?: Authenticator, factoryParams?: Params): Request => {
  return <RT extends ResponseType | undefined>(
    method: RequestMethod,
    path: string,
    body?: RequestBody | null,
    requestParams?: RefinedParams<RT> | null,
  ) => {
    const params = factoryParams || {};

    if (authenticator) {
      merge(params, {
        headers: {
          Authorization: authenticator.header,
        },
      });
    }

    return http.request<RT>(method, cleanURL(base, path), body, merge(params, requestParams));
  };
};

