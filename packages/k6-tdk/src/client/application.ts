import { check } from 'k6';
import { RefinedResponse } from 'k6/http';
import { Endpoints } from 'src/endpoints';

import { Version } from './client';

export class Application {
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

    const response = this.#endpoints.graph.v1.applications.list();

    check(response, {
      'client -> application.list - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }
}
