import { check } from 'k6';
import { RefinedResponse } from 'k6/http';

import { endpoints } from '@/endpoints';
import { Request } from '@/utils';

import { Version, versionSupported } from './client';

export class Drive {
  #version: Version;

  #request: Request;

  constructor(version: Version, request: Request) {
    this.#version = version;
    this.#request = request;
  }

  create(name: string): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.ocis)) {
      return;
    }
    
    const response = endpoints.graph.v1.drives.POST__create_drive(this.#request, { driveName: name });
    check(response, {
      'client -> drive.create - status': ({ status }) => {
        return status === 201
      }
    });

    return response;
  }

  delete(id: string): RefinedResponse<'none'> | undefined {
    if (!versionSupported(this.#version, Version.ocis)) {
      return;
    }

    const response = endpoints.graph.v1.drives.DELETE__delete_drive(this.#request, { driveId: id });
    check(response, {
      'client -> drive.delete - status': ({ status }) => {
        return status === 204
      }
    });

    return response;
  }
}
