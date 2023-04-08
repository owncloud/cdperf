import { check } from 'k6';
import { RefinedResponse } from 'k6/http';
import { Endpoints } from 'src/endpoints';

import { Version } from './client';

export class Role {
  #endpoints: Endpoints;

  #version: Version;

  constructor(version: Version, endpoints: Endpoints) {
    this.#version = version;
    this.#endpoints = endpoints;
  }

  list(): RefinedResponse<'text'> | undefined {
    if (this.#version !== Version.ocis) {
      return;
    }

    const response = this.#endpoints.api.v0.settings.rolesList();

    check(response, {
      'client -> role.list - status': ({ status }) => {
        return status === 201
      }
    });

    return response;
  }
}
