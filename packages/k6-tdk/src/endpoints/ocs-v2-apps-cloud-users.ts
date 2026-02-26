import { Endpoint } from './endpoints'

export const POST__create_user: Endpoint<{
  userLogin: string,
  userPassword: string
}, 'text'> = (httpClient, { userPassword, userLogin }) => {
  return httpClient('POST', '/ocs/v2.php/cloud/users', {
    userid: userLogin,
    password: userPassword,
    email: `${userLogin}@cdperf.org`
  }, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}

export const PUT__enable_user: Endpoint<{ userLogin: string }, 'text'> = (httpClient, { userLogin }) => {
  return httpClient('PUT', `/ocs/v2.php/cloud/users/${userLogin}/enable`, undefined, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}

export const DELETE__delete_user: Endpoint<{ userLogin: string }, 'text'> = (httpClient, { userLogin }) => {
  return httpClient('DELETE', `/ocs/v2.php/cloud/users/${userLogin}`, undefined, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}

export const POST__add_user_to_group: Endpoint<{ userLogin: string, groupName: string }, 'text'> = (httpClient, { userLogin, groupName }) => {
  return httpClient('POST', `/ocs/v2.php/cloud/users/${userLogin}/groups`, {
    groupid: groupName
  }, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}

export const DELETE__remove_user_from_group: Endpoint<{ userLogin: string, groupName: string }, 'text'> = (httpClient, { userLogin, groupName }) => {
  return httpClient('DELETE', `/ocs/v2.php/cloud/users/${userLogin}/groups`, {
    groupid: groupName
  }, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}
