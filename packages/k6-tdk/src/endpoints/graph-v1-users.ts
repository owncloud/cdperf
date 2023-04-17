import { Endpoint } from './endpoints'

export const POST__create_user: Endpoint<{ userLogin: string, userPassword: string }, 'text'> = (r, {
  userLogin,
  userPassword
}) => {
  return r('POST', '/graph/v1.0/users', JSON.stringify({
    onPremisesSamAccountName: userLogin,
    displayName: userLogin,
    mail: `${userLogin}@cdperf.org`,
    passwordProfile: { password: userPassword }
  }))
}

export const DELETE__delete_user: Endpoint<{ userLogin: string }, 'none'> = (r, { userLogin }) => {
  return r('DELETE', `/graph/v1.0/users/${userLogin}`)
}

export const POST__add_app_role_to_user: Endpoint<{
  principalId: string,
  appRoleId: string,
  resourceId: string
}, 'text'> = (r, { resourceId, principalId, appRoleId }) => {
  return r('POST', `/graph/v1.0/users/${principalId}/appRoleAssignments`, JSON.stringify({
    appRoleId,
    principalId,
    resourceId
  }))
}
