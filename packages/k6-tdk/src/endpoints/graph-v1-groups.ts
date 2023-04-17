import { Endpoint } from './endpoints'

export const POST__create_group: Endpoint<{ groupName: string }, 'text'> = (r, { groupName }) => {
  return r('POST', '/graph/v1.0/groups', JSON.stringify({
    displayName: groupName
  }))
}

export const DELETE__delete_group: Endpoint<{ groupId: string }, 'none'> = (r, { groupId }) => {
  return r('DELETE', `/graph/v1.0/groups/${groupId}`)
}
