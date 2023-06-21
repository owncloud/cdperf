import { objectToQueryString } from '@/utils'

import { Endpoint } from './endpoints'


export const GET__get_current_user_drives:Endpoint<{params?: Record<string, unknown>}, 'text'> = (httpClient, { params }) => {
  return httpClient('GET', `/graph/v1.0/me/drives?${objectToQueryString(params)}`)
}

export const GET__current_user:Endpoint<{}, 'text'> = (httpClient) => {
  return httpClient('GET', '/graph/v1.0/me?$expand=memberOf')
}
