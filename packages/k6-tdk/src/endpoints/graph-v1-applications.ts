import { Endpoint } from './endpoints'

export const GET__get_applications:Endpoint<{}, 'text'> = (r) => {
  return r('GET', '/graph/v1.0/applications')
}
