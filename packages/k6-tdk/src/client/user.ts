import { check } from 'k6';
import { RefinedResponse } from 'k6/http';
import { Endpoints } from 'src/endpoints';

import { Account } from '@/auth';

import { Version, versionSupported } from './client';

export class User {
  #endpoints: Endpoints;

  #version: Version;

  constructor(version: Version, endpoints: Endpoints) {
    this.#version = version;
    this.#endpoints = endpoints;
  }

  drives(): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.ocis)) {
      return;
    }

    const response = this.#endpoints.graph.v1.me.drives();

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

    const response = this.#endpoints.graph.v1.me.me();

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

    const response = this.#endpoints.ocs.v2.cloud.users.enable(id);

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
      response = this.#endpoints.graph.v1.users.create(account);
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.ocs.v2.cloud.users.create(account);
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
      response = this.#endpoints.graph.v1.users.delete(id);
      statusSuccess = 204;
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.ocs.v2.cloud.users.delete(id);
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

    const response = this.#endpoints.graph.v1.users.appRoleAssignments(principalId, appRoleId, resourceId);
    check(response, {
      'client -> user.assignRole - status': ({ status }) => {
        return status === 201
      }
    });

    return response;
  }
}
