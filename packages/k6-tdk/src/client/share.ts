import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'
import { Permission, ShareType } from '@/values'

import { EndpointClient } from './client'

export class Share extends EndpointClient {
  createShare(p: {
    shareResourcePath: string,
    shareType: ShareType,
    shareReceiver: string,
    spaceRef?: string,
    shareReceiverPermission: Permission
  }): RefinedResponse<'text'> {
    const response = endpoints.ocs.v2.apps.file_sharing.v1.shares.POST__create_share(this.httpClient, p,
      { platform: this.platform })

    check({ val: response }, {
      'client -> share.createShare - status': ({ status }) => {
        return status === 200
      }
    })

    return response
  }

  deleteShare(p: { shareId: string }): RefinedResponse<'text'> {
    const response = endpoints.ocs.v2.apps.file_sharing.v1.shares.DELETE__delete_share(this.httpClient, p)

    check({ val: response }, {
      'client -> share.deleteShare - status': ({ status }) => {
        return status === 200
      }
    })

    return response
  }

  acceptShare(p: { shareId: string }): RefinedResponse<'text'> {
    const response = endpoints.ocs.v2.apps.file_sharing.v1.shares.POST__accept_share(this.httpClient, p)

    check({ val: response }, {
      'client -> share.acceptShare - status': ({ status }) => {
        return status === 200
      }
    })

    return response
  }
}
