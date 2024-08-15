import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'

import { EndpointClient } from './client'

export class User extends EndpointClient {
  createUser(p: { userLogin: string, userPassword: string }): RefinedResponse<'text'> {
    const response = endpoints.graph.v1.users.POST__create_user(this.httpClient, p)

    check({ val: response }, {
      'client -> user.createUser - status': ({ status }) => {
        return status === 201
      }
    })
    return response
  }

  deleteUser(p: { userLogin: string }): RefinedResponse<'none'> {
    const response = endpoints.graph.v1.users.DELETE__delete_user(this.httpClient, p)

    check({ val: response }, {
      'client -> user.deleteUser - status': ({ status }) => {
        return status === 204
      }
    })
    return response
  }

  findUser(p: { user: string }): RefinedResponse<'text'> | undefined {
    const response = endpoints.graph.v1.users.GET_find_user(this.httpClient, p)
    
    check({ val: response }, {
      'client -> user.findUser - status': (r) => {
        return r?.status === 200
      }
    })
    return response
  }
}
