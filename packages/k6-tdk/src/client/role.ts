import { RefinedResponse } from 'k6/http';

import { endpoints } from '@/endpoints';
import { check } from '@/utils';

import { EndpointClient, Platform } from './client';

export class Role extends EndpointClient {
  getRoles(): RefinedResponse<'text'> | undefined {
    let response: RefinedResponse<'text'> | undefined
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.api.v0.settings.POST__get_roles(this.request, {})
    }

    check({ skip: !response, val: response }, {
      'client -> role.getRoles - status': (r) => {
        return r?.status === 201;
      }
    });

    return response;
  }

  addRoleToUser(p: {
    principalId: string,
    appRoleId: string,
    resourceId: string
  }): RefinedResponse<'text'> | undefined {
    let response: RefinedResponse<'text'> | undefined
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.graph.v1.users.POST__add_app_role_to_user(this.request, p)
    }

    check({ skip: !response, val: response }, {
      'client -> role.addRoleToUser - status': (r) => {
        return r?.status === 201;
      }
    });

    return response;
  }
}
