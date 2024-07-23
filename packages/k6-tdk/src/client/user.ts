import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'
import { Platform } from '@/values'

import { EndpointClient } from './client'

export class User extends EndpointClient {
  createUser(p: { userLogin: string, userPassword: string }): RefinedResponse<'text'> {
    let response: RefinedResponse<'text'>
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.ocs.v2.apps.cloud.users.POST__create_user(this.httpClient, p)
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.users.POST__create_user(this.httpClient, p)
    }

    check({ val: response }, {
      'client -> user.createUser - status': ({ status }) => {
        return [201, 200].includes(status)
      }
    })

    return response
  }

  deleteUser(p: { userLogin: string }): RefinedResponse<'text' | 'none'> {
    let expectedStatus: number
    let response: RefinedResponse<'text' | 'none'>
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.ocs.v2.apps.cloud.users.DELETE__delete_user(this.httpClient, p)
        expectedStatus = 200
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.users.DELETE__delete_user(this.httpClient, p)
        expectedStatus = 204
    }

    check({ val: response }, {
      'client -> user.deleteUser - status': ({ status }) => {
        return status === expectedStatus
      }
    })

    return response
  }

  enableUser(p: { userLogin: string }): RefinedResponse<'text'> | undefined {
    let response: RefinedResponse<'text'> | undefined

    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.ocs.v2.apps.cloud.users.PUT__enable_user(this.httpClient, p)
        break
      case Platform.ownCloudInfiniteScale:
      default:
    }

    check({ skip: !response, val: response }, {
      'client -> user.enableUser - status': (r) => {
        return r?.status === 200
      }
    })

    return response
  }
}
