import { Endpoint } from './endpoints'

export const GET__get_current_user_drives:Endpoint<{}, 'text'> = (httpClient) => {
  return httpClient('GET', '/graph/v1.0/me/drives')
}

export const GET__current_user:Endpoint<{}, 'text'> = (httpClient) => {
  return httpClient('GET', '/graph/v1.0/me?$expand=memberOf')
}
