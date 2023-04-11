import { check } from 'k6';
import { RefinedResponse } from 'k6/http';

import { endpoints } from '@/endpoints';
import { Request } from '@/utils';

import { Version, versionSupported } from './client';

export class Application {
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

    const response = endpoints.graph.v1.applications.GET__list_applications(this.#request, undefined);

    check(response, {
      'client -> application.list - status': ({ status }) => {
        return status === 200;
      },
    });

    return response;
  }
}
