import { RefinedResponse } from 'k6/http'

import { Platform } from '@/const'
import { endpoints } from '@/endpoints'
import { check } from '@/utils'

import { EndpointClient } from './client'

export class Drive extends EndpointClient {
  createDrive(p: { driveName: string }): RefinedResponse<'text'> | undefined {
    let response: RefinedResponse<'text'> | undefined
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.drives.POST__create_drive(this.request, p)
    }

    check({ skip: !response, val: response }, {
      'client -> application.createDrive - status': (r) => {
        return r?.status === 201
      }
    })

    return response
  }

  deleteDrive(p: { driveId: string }): RefinedResponse<'none'> | undefined {
    let response: RefinedResponse<'none'> | undefined
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.drives.DELETE__delete_drive(this.request, p)
    }

    check({ skip: !response, val: response }, {
      'client -> drive.deleteDrive - status': (r) => {
        return r?.status === 204
      }
    })

    return response
  }
}
