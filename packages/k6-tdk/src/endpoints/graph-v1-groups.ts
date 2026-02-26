import { Endpoint } from './endpoints'

export const GET_get_groups: Endpoint<{}, 'text'> = (httpClient) => {
  return httpClient('GET', '/graph/v1.0/groups')
}

export const POST__create_group: Endpoint<{ groupName: string }, 'text'> = (httpClient, { groupName }) => {
  return httpClient('POST', '/graph/v1.0/groups', JSON.stringify({
    displayName: groupName
  }))
}

export const DELETE__delete_group: Endpoint<{ groupId: string }, 'none'> = (httpClient, { groupId }) => {
  return httpClient('DELETE', `/graph/v1.0/groups/${groupId}`)
}

export const POST__add_user_to_group: Endpoint<{ groupId: string, userId: string, baseUrl: string }, 'none'> = (httpClient, { groupId, userId, baseUrl }) => {
  return httpClient('POST', `/graph/v1.0/groups/${groupId}/members/$ref`, JSON.stringify({
    '@odata.id': `${baseUrl}/graph/v1.0/users/${userId}`
  }))
}

export const DELETE__remove_user_from_group: Endpoint<{ groupId: string, userId: string }, 'none'> = (httpClient, { groupId, userId }) => {
  return httpClient('DELETE', `/graph/v1.0/groups/${groupId}/members/${userId}/$ref`)
}
