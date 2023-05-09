import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'
import { Platform } from '@/values'

import { EndpointClient } from './client'

export class Application extends EndpointClient {
  listApplications(): RefinedResponse<'text'> | undefined {
    let response: RefinedResponse<'text'> | undefined
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.applications.GET__get_applications(this.httpClient, {})
    }

    check({ skip:!response, val: response }, {
      'client -> application.listApplications - status': (r) => {
        return r?.status === 200
      }
    })

    return response
  }
}
