import { RefinedResponse } from 'k6/http';

import { Platform } from '@/const';
import { endpoints } from '@/endpoints';
import { check } from '@/utils';

import { EndpointClient } from './client';

export class Group extends EndpointClient {
  createGroup(p: { groupName: string }): RefinedResponse<'text'> {
    let response: RefinedResponse<'text'>
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.ocs.v2.apps.cloud.groups.POST__create_group(this.request, p)
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.groups.POST__create_group(this.request, p);
    }

    check({ val: response }, {
      'client -> group.createGroup - status': ({ status }) => {
        return status === 200;
      }
    });

    return response;
  }

  deleteGroup(p: { groupIdOrName: string }): RefinedResponse<'text' | 'none'> {
    let response: RefinedResponse<'text' | 'none'>
    let expectedStatus: number
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.ocs.v2.apps.cloud.groups.DELETE__delete_group(this.request, { groupName: p.groupIdOrName })
        expectedStatus = 200
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.groups.DELETE__delete_group(this.request, { groupId: p.groupIdOrName })
        expectedStatus = 204
    }

    check({ val: response }, {
      'client -> group.deleteGroup - status': ({ status }) => {
        return status === expectedStatus;
      }
    });

    return response;
  }
}
