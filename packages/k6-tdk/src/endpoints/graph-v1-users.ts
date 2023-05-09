import { Endpoint } from './endpoints'

export const POST__create_user: Endpoint<{ userLogin: string, userPassword: string }, 'text'> = (httpClient, {
  userLogin,
  userPassword
}) => {
  return httpClient('POST', '/graph/v1.0/users', JSON.stringify({
    onPremisesSamAccountName: userLogin,
    displayName: userLogin,
    mail: `${userLogin}@cdperf.org`,
    passwordProfile: { password: userPassword }
  }))
}

export const DELETE__delete_user: Endpoint<{ userLogin: string }, 'none'> = (httpClient, { userLogin }) => {
  return httpClient('DELETE', `/graph/v1.0/users/${userLogin}`)
}

export const POST__add_app_role_to_user: Endpoint<{
  principalId: string,
  appRoleId: string,
  resourceId: string
}, 'text'> = (httpClient, { resourceId, principalId, appRoleId }) => {
  return httpClient('POST', `/graph/v1.0/users/${principalId}/appRoleAssignments`, JSON.stringify({
    appRoleId,
    principalId,
    resourceId
  }))
}
