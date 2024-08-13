import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'

import { EndpointClient } from './client'

export class Drive extends EndpointClient {
  createDrive(p: { driveName: string }): RefinedResponse<'text'> {
    const response = endpoints.graph.v1.drives.POST__create_drive(this.httpClient, p)

    check({ val: response }, {
      'client -> application.createDrive - status': (r) => {
        return r?.status === 201
      }
    })

    return response
  }

  deactivateDrive(p: { driveId: string }): RefinedResponse<'none'> {
    const response = endpoints.graph.v1.drives.DELETE__deactivate_drive(this.httpClient, p)

    check({ val: response }, {
      'client -> drive.deactivateDrive - status': (r) => {
        return r?.status === 204
      }
    })

    return response
  }

  deleteDrive(p: { driveId: string }): RefinedResponse<'none'> {
    const response = endpoints.graph.v1.drives.DELETE__delete_drive(this.httpClient, p)

    check({ val: response }, {
      'client -> drive.deleteDrive - status': (r) => {
        return r?.status === 204
      }
    })

    return response
  }
}
