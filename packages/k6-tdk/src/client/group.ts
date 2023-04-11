import { check } from 'k6';
import { RefinedResponse } from 'k6/http';

import { endpoints } from '@/endpoints';
import { Request } from '@/utils';

import { Version } from './client';

export class Group {
  #version: Version;

  #request: Request;

  constructor(version: Version, request: Request) {
    this.#version = version;
    this.#request = request;
  }

  create(id: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
      case Version.occ:
      case Version.nc:
        response = endpoints.ocs.v2.apps.cloud.groups.POST__create_group(this.#request, { groupName: id });
        break;
      case Version.ocis:
      default:
        response = endpoints.graph.v1.groups.POST__create_group(this.#request, { groupName: id });
        break;
    }

    check(response, {
      'client -> group.create - status': ({ status }) => {
        return status === 200;
      },
    });

    return response;
  }

  delete(id: string): RefinedResponse<'text'> {
    let response;
    let statusSuccess: number;

    switch (this.#version) {
      case Version.occ:
      case Version.nc:
        response = endpoints.ocs.v2.apps.cloud.groups.DELETE__delete_group(this.#request, { groupName: id });
        statusSuccess = 200;
        break;
      case Version.ocis:
      default:
        response = endpoints.graph.v1.groups.DELETE__delete_group(this.#request, { groupName: id });
        statusSuccess = 204;
        break;
    }

    check(response, {
      'client -> group.delete - status': ({ status }) => {
        return status === statusSuccess;
      },
    });

    return response;
  }
}
