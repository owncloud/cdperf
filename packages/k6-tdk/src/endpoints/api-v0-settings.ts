import { Endpoint } from './endpoints'

export const POST__get_roles:Endpoint<{}, 'text'> = (r) => {
  return r('POST', '/api/v0/settings/roles-list', JSON.stringify({}))
}
