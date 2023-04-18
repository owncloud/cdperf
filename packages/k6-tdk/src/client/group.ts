import { check } from 'k6';
import { RefinedResponse } from 'k6/http';
import { Endpoints } from 'src/endpoints';

import { Version } from './client';

export class Group {
  #endpoints: Endpoints;

  #version: Version;

  constructor(version: Version, endpoints: Endpoints) {
    this.#version = version;
    this.#endpoints = endpoints;
  }

  create(id: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
    case Version.ocis:
      response = this.#endpoints.graph.v1.groups.create(id);
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.ocs.v2.cloud.groups.create(id);
      break;
    }

    check(response, {
      'client -> group.create - status': ({ status }) => {
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
      response = this.#endpoints.graph.v1.groups.delete(id);
      statusSuccess = 204;
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.ocs.v2.cloud.groups.delete(id);
      statusSuccess = 200;
      break;
    }

    check(response, {
      'client -> group.delete - status': ({ status }) => {
        return status === statusSuccess
      }
    });

    return response;
  }
}
