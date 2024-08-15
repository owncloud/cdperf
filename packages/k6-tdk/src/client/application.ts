import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'

import { EndpointClient } from './client'

export class Application extends EndpointClient {
  listApplications(): RefinedResponse<'text'> {
    const response = endpoints.graph.v1.applications.GET__get_applications(this.httpClient, {})

    check({ val: response }, {
      'client -> application.listApplications - status': (r) => {
        return r?.status === 200
      }
    })

    return response
  }
}
