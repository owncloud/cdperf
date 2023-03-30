import http, { Params, RefinedParams, RefinedResponse, RequestBody, ResponseType } from 'k6/http';
import { merge } from 'lodash-es';

import { Authenficator } from '@/auth';
import { cleanURL } from '@/utils';


export type RequestMethod = 'GET' | 'MKCOL' | 'PROPFIND' | 'DELETE' | 'MOVE' | 'PUT' | 'POST';

export type Request = <RT extends ResponseType | undefined>(
  method: RequestMethod,
  url: string,
  body?: RequestBody | null,
  params?: RefinedParams<RT> | null,
) => RefinedResponse<RT>;

export const requestFactory = (base: string, authenficator?: Authenficator, factoryParams?: Params): Request => {
  return <RT extends ResponseType | undefined>(
    method: RequestMethod,
    path: string,
    body?: RequestBody | null,
    requestParams?: RefinedParams<RT> | null,
  ) => {
    const params = factoryParams || {};

    if (authenficator) {
      merge(params, {
        headers: {
          Authorization: authenficator.header,
        },
      });
    }

    return http.request<RT>(method, cleanURL(base, path), body, merge(params, requestParams));
  };
};

