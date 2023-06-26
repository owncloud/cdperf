import { Endpoint } from './endpoints'

export const GET__get_applications:Endpoint<{}, 'text'> = (httpClient) => {
  return httpClient('GET', '/graph/v1.0/applications')
}
