import { check } from 'k6';
import { RefinedResponse } from 'k6/http';
import { Endpoints } from 'src/endpoints';
import { create } from 'xmlbuilder2';

import { Version, versionSupported } from './client';

export class Tag {
  #endpoints: Endpoints;

  #version: Version;

  constructor(version: Version, endpoints: Endpoints) {
    this.#version = version;
    this.#endpoints = endpoints;
  }

  create(name: string, canAssign = true, userAssignable = true, userVisible = true): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.occ, Version.nc)) {
      return;
    }

    const response = this.#endpoints.dav.systemtags.create(name, canAssign, userAssignable, userVisible);

    check(response, {
      'client -> tag.create - status': ({ status }) => {
        return status === 201
      }
    });

    return response;
  }

  delete(id: string): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.occ, Version.nc)) {
      return;
    }

    const response = this.#endpoints.dav.systemtags.delete(id);

    check(response, {
      'client -> tag.delete - status': ({ status }) => {
        return status === 204
      }
    });

    return response;
  }

  list(): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.occ, Version.nc)) {
      return;
    }

    const oc = 'http://owncloud.org/ns'
    const dav = 'DAV:'
    const response = this.#endpoints.dav.systemtags.list(create({ version: '1.0', encoding: 'UTF-8' })
      .ele(dav, 'propfind')
      .ele(dav, 'prop')
      .ele(oc, 'display-name')
      .up()
      .ele(oc, 'user-visible')
      .up()
      .ele(oc, 'user-assignable')
      .up()
      .ele(oc, 'id')
      .up()
      .end());

    check(response, {
      'client -> tag.list - status': ({ status }) => {
        return status === 207
      }
    });

    return response;
  }

  assign(resourceId: string, tag: string): RefinedResponse<'text'> {
    let response
    let statusSuccess

    switch (this.#version) {
    case Version.ocis:
      response = this.#endpoints.graph.v1.extensions.orgLibreGraph.tags.assign(resourceId, tag);
      statusSuccess = 200;
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.dav.systemtagsRelations.assign(resourceId, tag);
      statusSuccess = 201;
      break;
    }

    check(response, {
      'client -> tag.assign - status': ({ status }) => {
        return status === statusSuccess
      }
    });

    return response;
  }

  unassign(resourceId: string, tag: string): RefinedResponse<'text'> {
    let response
    let statusSuccess

    switch (this.#version) {
    case Version.ocis:
      response = this.#endpoints.graph.v1.extensions.orgLibreGraph.tags.unassign(resourceId, tag);
      statusSuccess = 200;
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.dav.systemtagsRelations.unassign(resourceId, tag);
      statusSuccess = 204;
      break;
    }

    check(response, {
      'client -> tag.unassign - status': ({ status }) => {
        return status === statusSuccess
      }
    });

    return response;
  }

  get(resourceId: string): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.occ, Version.nc)) {
      return;
    }

    const oc = 'http://owncloud.org/ns'
    const dav = 'DAV:'
    const response = this.#endpoints.dav.systemtagsRelations.propfind(resourceId, create({ version: '1.0', encoding: 'UTF-8' })
      .ele(dav, 'propfind')
      .ele(dav, 'prop')
      .ele(oc, 'display-name')
      .up()
      .ele(oc, 'user-visible')
      .up()
      .ele(oc, 'user-assignable')
      .up()
      .ele(oc, 'id')
      .up()
      .end());
    check(response, {
      'client -> tag.get - status': ({ status }) => {
        return status === 207
      }
    });

    return response;
  }
}
