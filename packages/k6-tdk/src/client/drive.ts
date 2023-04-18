import { check } from 'k6';
import { RefinedResponse } from 'k6/http';
import { Endpoints } from 'src/endpoints';

import { Version, versionSupported } from './client';

export class Drive {
  #endpoints: Endpoints;

  #version: Version;

  constructor(version: Version, endpoints: Endpoints) {
    this.#version = version;
    this.#endpoints = endpoints;
  }

  create(name: string): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.ocis)) {
      return;
    }

    const response = this.#endpoints.graph.v1.drives.create(name);

    check(response, {
      'client -> drive.create - status': ({ status }) => {
        return status === 201
      }
    });

    return response;
  }

  delete(id: string): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.ocis)) {
      return;
    }

    const response = this.#endpoints.graph.v1.drives.delete(id);

    check(response, {
      'client -> drive.delete - status': ({ status }) => {
        return status === 204
      }
    });

    return response;
  }
}
