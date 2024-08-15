import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'

import { EndpointClient } from './client'

export class Role extends EndpointClient {
  getRoles(): RefinedResponse<'text'> | undefined {
    const response = endpoints.graph.v1.applications.GET__get_applications(this.httpClient, {})

    check({ val: response }, {
      'client -> role.getRoles - status': (r) => {
        return r?.status === 200
      }
    })

    return response
  }

  addRoleToUser(p: {
    principalId: string,
    appRoleId: string,
    resourceId: string
  }): RefinedResponse<'text'> {
    const response = endpoints.graph.v1.users.POST__add_app_role_to_user(this.httpClient, p)

    check({ val: response }, {
      'client -> role.addRoleToUser - status': (r) => {
        return r?.status === 201
      }
    })

    return response
  }
}
