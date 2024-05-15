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

export const POST__add_group_member: Endpoint<{ groupId: string, userId: string }, 'none'> = (httpClient, { groupId, userId }) => {
  return httpClient('POST', `/graph/v1.0/groups/${groupId}/members/$ref`, JSON.stringify({
    '@odata.id': `https://localhost:9200/graph/v1.0/users/${userId}`
  }))
}
