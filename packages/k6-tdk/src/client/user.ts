import { check } from 'k6';
import { RefinedResponse } from 'k6/http';

import { Account } from '@/auth';
import { endpoints } from '@/endpoints';
import { Request } from '@/utils';

import { Version, versionSupported } from './client';

export class User {
  #version: Version;

  #request: Request;

  constructor(version: Version, request: Request) {
    this.#version = version;
    this.#request = request;
  }

  drives(): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.ocis)) {
      return;
    }
    const response = endpoints.graph.v1.me.GET__list_current_user_drives(this.#request, undefined)

    check(response, {
      'client -> user.drives - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }

  me(): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.ocis)) {
      return;
    }
    const response = endpoints.graph.v1.me.GET__current_user(this.#request, undefined)

    if (!response) {
      return;
    }

    check(response, {
      'client -> user.me - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }

  enable(id: string): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.occ, Version.nc)) {
      return;
    }
    const response = endpoints.ocs.v2.apps.cloud.users.PUT__enable_user(this.#request, {
      userId: id
    })

    check(response, {
      'client -> user.enable - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }

  create(account: Account): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
    case Version.ocis:
      response = endpoints.graph.v1.users.POST__create_user(this.#request, {
        userLogin: account.login,
        userPassword: account.password
      })
      break;
    case Version.occ:
    case Version.nc:
      response = endpoints.ocs.v2.apps.cloud.users.POST__create_user(this.#request, {
        userLogin: account.login,
        userPassword: account.password
      })
      break;
    }

    check(response, {
      'client -> user.create - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }

  delete(id: string): RefinedResponse<'text'> {
    let response;
    let statusSuccess: number;

    switch (this.#version) {
    case Version.ocis:
      response = endpoints.graph.v1.users.DELETE__delete_user(this.#request, {
        userId: id
      })
      statusSuccess = 204;
      break;
    case Version.occ:
    case Version.nc:
      response = endpoints.ocs.v2.apps.cloud.users.DELETE__delete_user(this.#request, {
        userId: id
      })
      statusSuccess = 200;
      break;
    }

    check(response, {
      'client -> user.delete - status': ({ status }) => {
        return status === statusSuccess
      }
    });

    return response;
  }

  assignRole(principalId: string, appRoleId: string, resourceId: string): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.ocis)) {
      return;
    }
    
    const response = endpoints.graph.v1.users.POST__add_app_role_to_user(this.#request, {
      appRoleId: appRoleId,
      resourceId: resourceId,
      principalId: principalId
    })
    check(response, {
      'client -> user.assignRole - status': ({ status }) => {
        return status === 201
      }
    });

    return response;
  }
}
