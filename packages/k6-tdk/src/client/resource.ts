import { check } from 'k6';
import { RefinedResponse, RequestBody } from 'k6/http';
import { Endpoints } from 'src/endpoints';
import { create } from 'xmlbuilder2';

import { Version } from './client';

export class Resource {
  #endpoints: Endpoints;

  #version: Version;

  constructor(version: Version, endpoints: Endpoints) {
    this.#version = version;
    this.#endpoints = endpoints;
  }

  upload(id: string, path: string, body: RequestBody): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
    case Version.ocis:
      response = this.#endpoints.dav.spaces.upload(id, path, body);
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.dav.files.upload(id, path, body);
      break;
    }

    check(response, {
      'client -> resource.upload - status': ({ status }) => {
        return status === 201
      }
    });

    return response;
  }

  create(id: string, path: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
    case Version.ocis:
      response = this.#endpoints.dav.spaces.create(id, path);
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.dav.files.create(id, path);
      break;
    }

    check(response, {
      'client -> resource.create - status': ({ status }) => {
        return status === 201
      }
    });

    return response;
  }

  download(id: string, path: string): RefinedResponse<'binary'> {
    let response;
    switch (this.#version) {
    case Version.ocis:
      response = this.#endpoints.dav.spaces.download(id, path);
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.dav.files.download(id, path);
      break;
    }

    check(response, {
      'client -> resource.download - status': ({ status }) => {
        return status === 200
      }
    });

    return response;
  }

  propfind(id: string, path: string): RefinedResponse<'text'> {
    const oc = 'http://owncloud.org/ns'
    const dav = 'DAV:'
    const body = create({ version: '1.0', encoding: 'UTF-8' })
      .ele(dav, 'propfind')
      .ele(dav, 'prop')
      .ele(oc, 'fileid')
      .end();

    let response;
    switch (this.#version) {
    case Version.ocis:
      response = this.#endpoints.dav.spaces.propfind(id, path);
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.dav.files.propfind(id, path, body);
      break;
    }

    check(response, {
      'client -> resource.propfind - status': ({ status }) => {
        return status === 207
      }
    });

    return response;
  }

  delete(id: string, path: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
    case Version.ocis:
      response = this.#endpoints.dav.spaces.delete(id, path);
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.dav.files.delete(id, path);
      break;
    }

    check(response, {
      'client -> resource.delete - status': ({ status }) => {
        return status === 204
      }
    });

    return response;
  }

  move(id: string, from: string, to: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
    case Version.ocis:
      response = this.#endpoints.dav.spaces.move(id, from, to);
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.dav.files.move(id, from, to);
      break;
    }

    check(response, {
      'client -> resource.move - status': ({ status }) => {
        return status === 201
      }
    });

    return response;
  }
}
