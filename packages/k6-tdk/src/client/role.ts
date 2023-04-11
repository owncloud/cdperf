import { check } from 'k6';
import { RefinedResponse } from 'k6/http';

import { endpoints } from '@/endpoints';
import { Request } from '@/utils';

import { Version, versionSupported } from './client';

export class Role {
  #version: Version;

  #request: Request;

  constructor(version: Version, request: Request) {
    this.#version = version;
    this.#request = request;
  }

  list(): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.ocis)) {
      return;
    }

    const response = endpoints.api.v0.settings.POST__list_roles(this.#request, undefined);

    check(response, {
      'client -> role.list - status': ({ status }) => {
        return status === 201;
      },
    });

    return response;
  }
}
