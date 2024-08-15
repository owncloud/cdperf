import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'

import { EndpointClient } from './client'

export class Me extends EndpointClient {
  getMyProfile(): RefinedResponse<'text'> {
    const response = endpoints.graph.v1.me.GET__current_user(this.httpClient, {})

    check({ val: response }, {
      'client -> role.getMyProfile - status': (r) => {
        return r?.status === 200
      }
    })

    return response
  }

  getMyDrives(p: { params?: Record<string, unknown> }): RefinedResponse<'text'> {
    const response = endpoints.graph.v1.me.GET__get_current_user_drives(this.httpClient, { params: p.params })

    check({ val: response }, {
      'client -> role.getMyDrives - status': (r) => {
        return r?.status === 200
      }
    })

    return response
  }
}
