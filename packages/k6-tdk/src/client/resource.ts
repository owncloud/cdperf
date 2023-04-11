import { check } from 'k6';
import { RefinedResponse, RequestBody } from 'k6/http';
import { create } from 'xmlbuilder2';

import { endpoints } from '@/endpoints';
import { Request } from '@/utils';

import { Version } from './client';

export class Resource {
  #version: Version;

  #request: Request;

  constructor(version: Version, request: Request) {
    this.#version = version;
    this.#request = request;
  }

  upload(id: string, path: string, body: RequestBody): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
      case Version.occ:
      case Version.nc:
        response = endpoints.dav.files.PUT__upload_resource(this.#request, { resourcePath: path, userId: id, resourceBytes: body });
        break;
      case Version.ocis:
      default:
        response = endpoints.dav.spaces.PUT__upload_resource(this.#request, { resourcePath: path, spaceId: id, resourceBytes: body });
        break;
    }

    check(response, {
      'client -> resource.upload - status': ({ status }) => {
        return status === 201;
      },
    });

    return response;
  }

  create(id: string, path: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
      case Version.occ:
      case Version.nc:
        response = endpoints.dav.files.MKCOL__create_resource(this.#request, { resourcePath: path, userId: id });
        break;
      case Version.ocis:
      default:
        response = endpoints.dav.spaces.MKCOL__create_resource(this.#request, { resourcePath: path, spaceId: id });
        break;
    }

    check(response, {
      'client -> resource.create - status': ({ status }) => {
        return status === 201;
      },
    });

    return response;
  }

  download(id: string, path: string): RefinedResponse<'binary'> {
    let response;
    switch (this.#version) {
      case Version.occ:
      case Version.nc:
        response = endpoints.dav.files.GET__download_resource(this.#request, { resourcePath: path, userId: id });
        break;
      case Version.ocis:
      default:
        response = endpoints.dav.spaces.GET__download_resource(this.#request, { resourcePath: path, spaceId: id });
        break;
    }

    check(response, {
      'client -> resource.download - status': ({ status }) => {
        return status === 200;
      },
    });

    return response;
  }

  propfind(id: string, path: string): RefinedResponse<'text'> {
    const oc = 'http://owncloud.org/ns';
    const dav = 'DAV:';
    const body = create({ version: '1.0', encoding: 'UTF-8' })
      .ele(dav, 'propfind')
      .ele(dav, 'prop')
      .ele(oc, 'fileid')
      .end();

    let response;
    switch (this.#version) {
      case Version.occ:
      case Version.nc:
        response = endpoints.dav.files.PROPFIND__properties_for_resource(this.#request, { resourcePath: path, userId: id, propfindXml: body });
        break;
      case Version.ocis:
      default:
        response = endpoints.dav.spaces.PROPFIND__properties_for_resource(this.#request, { resourcePath: path, spaceId: id });
        break;
    }

    check(response, {
      'client -> resource.propfind - status': ({ status }) => {
        return status === 207;
      },
    });

    return response;
  }

  delete(id: string, path: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
      case Version.occ:
      case Version.nc:
        response = endpoints.dav.files.DELETE__delete_resource(this.#request, { resourcePath: path, userId: id });
        break;
      case Version.ocis:
      default:
        response = endpoints.dav.spaces.DELETE__delete_resource(this.#request, { resourcePath: path, spaceId: id });
        break;
    }

    check(response, {
      'client -> resource.delete - status': ({ status }) => {
        return status === 204;
      },
    });

    return response;
  }

  move(id: string, from: string, to: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
      case Version.occ:
      case Version.nc:
        response = endpoints.dav.files.MOVE__move_resource(this.#request, { userId: id, fromResourcePath: from, toResourcePath: to });
        break;
      case Version.ocis:
      default:
        response = endpoints.dav.spaces.MOVE__move_resource(this.#request, { spaceId: id, fromResourcePath: from, toResourcePath: to });
        break;
    }

    check(response, {
      'client -> resource.move - status': ({ status }) => {
        return status === 201;
      },
    });

    return response;
  }
}
