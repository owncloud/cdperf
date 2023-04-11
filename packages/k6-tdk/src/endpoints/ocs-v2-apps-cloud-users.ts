import { Endpoint } from './endpoints';

export const POST__create_user: Endpoint<{
  userLogin: string,
  userPassword: string
}, 'text'> = (r, { userPassword, userLogin }) => {
  return r('POST', '/ocs/v2.php/cloud/users', {
    userid: userLogin,
    password: userPassword,
    email: `${userLogin}@cdperf.org`
  }, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}

export const PUT__enable_user: Endpoint<{ userId: string }, 'text'> = (r, { userId }) => {
  return r('PUT', `/ocs/v2.php/cloud/users/${userId}/enable`, undefined, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}

export const DELETE__delete_user: Endpoint<{ userId: string }, 'text'> = (r, { userId }) => {
  return r('DELETE', `/ocs/v2.php/cloud/users/${userId}`, undefined, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}
