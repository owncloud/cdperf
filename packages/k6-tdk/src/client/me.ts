import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'
import { Platform } from '@/values'

import { EndpointClient } from './client'

export class Me extends EndpointClient {
  getMyProfile(): RefinedResponse<'text'> | undefined {
    let response: RefinedResponse<'text'> | undefined
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.me.GET__current_user(this.httpClient, {})
    }

    check({ skip: !response, val: response }, {
      'client -> role.getMyProfile - status': (r) => {
        return r?.status === 200
      }
    })

    return response
  }

  getMyDrives(p: { params?: Record<string, unknown> }): RefinedResponse<'text'> | undefined {
    let response: RefinedResponse<'text'> | undefined
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.me.GET__get_current_user_drives(this.httpClient, { params: p.params })
    }

    check({ skip: !response, val: response }, {
      'client -> role.getMyDrives - status': (r) => {
        return r?.status === 200
      }
    })

    return response
  }
}
