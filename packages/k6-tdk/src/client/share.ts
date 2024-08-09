import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'
import { Roles, ShareType } from '@/values'

import { EndpointClient } from './client'

export class Share extends EndpointClient {
  createShareInvitation(p: {
    driveId: string,
    itemId: string,
    recipientId: string,
    roleId: Roles,
    shareType: ShareType
  }): RefinedResponse<'text'> {
    const response = endpoints.graph.v1beta1.invite.POST__create_share_invitation(this.httpClient, p)    

    check({ val: response }, {
      'client -> share.createShareInvitation - status': ({ status }) => {
        return status === 200
      }
    })

    return response
  }

  deleteShareInvitation(p: { driveId: string, itemId: string, shareId: string }): RefinedResponse<'text'> {
    const response = endpoints.graph.v1beta1.invite.DELETE__delete_share_invitation(this.httpClient, p)

    check({ val: response }, {
      'client -> share.deleteShareInvitation - status': ({ status }) => {
        return status === 204
      }
    })

    return response
  }

  createSpaceInvitation(p: {
    driveId: string,
    recipientId: string,
    roleId: Roles,
    shareType: ShareType
  }): RefinedResponse<'text'> {
    const response = endpoints.graph.v1beta1.invite.POST__create_space_invitation(this.httpClient, p)    

    check({ val: response }, {
      'client -> share.createSpaceInvitation - status': ({ status }) => {
        return status === 200
      }
    })

    return response
  }
}
