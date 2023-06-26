import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'
import { Platform } from '@/values'

import { EndpointClient } from './client'

export class Group extends EndpointClient {
  getGroups(): RefinedResponse<'text'> | undefined {
    let response: RefinedResponse<'text'> | undefined
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.groups.GET_get_groups(this.httpClient, {})
    }

    check({ skip: !response, val: response }, {
      'client -> group.getGroups - status': (r) => {
        return r?.status === 200
      }
    })

    return response
  }

  createGroup(p: { groupName: string }): RefinedResponse<'text'> {
    let response: RefinedResponse<'text'>
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.ocs.v2.apps.cloud.groups.POST__create_group(this.httpClient, p)
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.groups.POST__create_group(this.httpClient, p)
    }

    check({ val: response }, {
      'client -> group.createGroup - status': ({ status }) => {
        return status === 200
      }
    })

    return response
  }

  deleteGroup(p: { groupIdOrName: string }): RefinedResponse<'text' | 'none'> {
    let response: RefinedResponse<'text' | 'none'>
    let expectedStatus: number
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.ocs.v2.apps.cloud.groups.DELETE__delete_group(this.httpClient, { groupName: p.groupIdOrName })
        expectedStatus = 200
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.groups.DELETE__delete_group(this.httpClient, { groupId: p.groupIdOrName })
        expectedStatus = 204
    }

    check({ val: response }, {
      'client -> group.deleteGroup - status': ({ status }) => {
        return status === expectedStatus
      }
    })

    return response
  }
}
