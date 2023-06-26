import { Endpoint } from './endpoints'

export const POST__create_group: Endpoint<{ groupName: string }, 'text'> = (httpClient, { groupName }) => {
  return httpClient('POST', '/ocs/v2.php/cloud/groups', {
    groupid: groupName
  }, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}

export const DELETE__delete_group: Endpoint<{ groupName: string }, 'text'> = (httpClient, { groupName }) => {
  return httpClient('DELETE', `/ocs/v2.php/cloud/groups/${groupName}`, undefined, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}
