import { check } from 'k6';
import { RefinedResponse } from 'k6/http';
import { create } from 'xmlbuilder2';

import { endpoints } from '@/endpoints';
import { Request } from '@/utils';

import { Version, versionSupported } from './client';

export class Tag {
  #version: Version;

  #request: Request;

  constructor(version: Version, request: Request) {
    this.#version = version;
    this.#request = request;
  }

  create(name: string, canAssign = true, userAssignable = true, userVisible = true): RefinedResponse<'none'> | undefined {
    if (!versionSupported(this.#version, Version.occ, Version.nc)) {
      return;
    }

    const response = endpoints.dav.systemtags.POST__create_tag(this.#request, {
      tagName: name,
      canAssignTag: canAssign,
      userAssignableTag: userAssignable,
      userVisibleTag: userVisible,
    });

    check(response, {
      'client -> tag.create - status': ({ status }) => {
        return status === 201;
      },
    });

    return response;
  }

  delete(id: string): RefinedResponse<'none'> | undefined {
    if (!versionSupported(this.#version, Version.occ, Version.nc)) {
      return;
    }
    const response = endpoints.dav.systemtags.DELETE__delete_tag(this.#request, {
      tagId: id,
    });

    check(response, {
      'client -> tag.delete - status': ({ status }) => {
        return status === 204;
      },
    });

    return response;
  }

  list(): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.occ, Version.nc)) {
      return;
    }

    const oc = 'http://owncloud.org/ns';
    const dav = 'DAV:';
    const response = endpoints.dav.systemtags.PROPFIND__get_tags_with_properties(this.#request, {
      propfindXml: create({ version: '1.0', encoding: 'UTF-8' })
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
        .end(),
    });

    check(response, {
      'client -> tag.list - status': ({ status }) => {
        return status === 207;
      },
    });

    return response;
  }

  assign(resourceId: string, tag: string): RefinedResponse<'text'> {
    let response;
    let statusSuccess;

    switch (this.#version) {
      case Version.occ:
      case Version.nc:
        response = endpoints.dav.systemtags_relations.PUT__add_tag_to_resource(this.#request, {
          tagId: tag,
          resourceId,
        });

        statusSuccess = 201;
        break;
      case Version.ocis:
      default:
        response = endpoints.graph.v1.extensions.org_libre_graph.tags.PUT__add_tags_to_resource(this.#request, {
          tagNames: [tag],
          resourceId,
        });
        statusSuccess = 200;
        break;
    }

    check(response, {
      'client -> tag.assign - status': ({ status }) => {
        return status === statusSuccess;
      },
    });

    return response;
  }

  unassign(resourceId: string, tag: string): RefinedResponse<'text'> {
    let response;
    let statusSuccess;

    switch (this.#version) {
      case Version.occ:
      case Version.nc:
        response = endpoints.dav.systemtags_relations.DELETE__remove_tag_from_resource(this.#request, {
          tagId: tag,
          resourceId,
        });
        statusSuccess = 204;
        break;
      case Version.ocis:
      default:
        response = endpoints.graph.v1.extensions.org_libre_graph.tags.DELETE__remove_tags_from_resource(this.#request, {
          tagNames: [tag],
          resourceId,
        });
        statusSuccess = 200;
        break;
    }

    check(response, {
      'client -> tag.unassign - status': ({ status }) => {
        return status === statusSuccess;
      },
    });

    return response;
  }

  get(resourceId: string): RefinedResponse<'text'> | undefined {
    if (!versionSupported(this.#version, Version.occ, Version.nc)) {
      return;
    }

    const oc = 'http://owncloud.org/ns';
    const dav = 'DAV:';
    const response = endpoints.dav.systemtags_relations.PROPFIND__get_tags_with_properties_for_resource(this.#request, {
      resourceId,
      propfindXml: create({
        version: '1.0',
        encoding: 'UTF-8',
      })
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
        .end(),
    });
    check(response, {
      'client -> tag.get - status': ({ status }) => {
        return status === 207;
      },
    });

    return response;
  }
}
