import { check } from 'k6';
import { RefinedResponse } from 'k6/http';
import { create } from 'xmlbuilder2';

import { endpoints, ItemType } from '@/endpoints';
import { Request } from '@/utils';

import { Version } from './client';

export class Search {
  #version: Version;

  #request: Request;

  constructor(version: Version, request: Request) {
    this.#version = version;
    this.#request = request;
  }

  sharee(search: string, itemType: ItemType): RefinedResponse<'text'> {
    const response = endpoints.ocs.v2.apps.file_sharing.v1.sharees.GET__search_sharees(this.#request, {
      searchQuery: search,
      searchItemType: itemType,
    });

    check(response, {
      'client -> search.sharee - status': ({ status }) => {
        return status === 200;
      },
    });

    return response;
  }

  resource(id: string, { query = '', limit = 10 }): RefinedResponse<'text'> {
    const oc = 'http://owncloud.org/ns';
    const dav = 'DAV:';

    let response;
    switch (this.#version) {
      case Version.nc:
        response = endpoints.dav.SEARCH__search_for_resources(this.#request, {
          searchXml: create({ version: '1.0', encoding: 'UTF-8' })
            .ele(dav, 'searchrequest')
            .ele(dav, 'basicsearch')
            .ele(dav, 'select')
            .ele(dav, 'prop')
            .ele(oc, 'fileid')
            .up()
            .up()
            .up()
            .ele(dav, 'from')
            .ele(dav, 'scope')
            .ele(dav, 'href')
            .txt(`/files/${id}`)
            .up()
            .ele(dav, 'depth')
            .txt('infinity')
            .up()
            .up()
            .up()
            .ele(dav, 'where')
            .ele(dav, 'like')
            .ele(dav, 'prop')
            .ele(dav, 'displayname')
            .up()
            .up()
            .ele(dav, 'literal')
            .txt(query)
            .up()
            .up()
            .ele(dav, 'orderby')
            .end(),
        });
        break;
      case Version.ocis:
      case Version.occ:
      default:
        response = endpoints.dav.files.REPORT__report_for_resources(this.#request, {
          userId: id,
          reportXml: create({ version: '1.0', encoding: 'UTF-8' })
            .ele(oc, 'search-files')
            .ele(dav, 'prop')
            .ele(oc, 'fileid')
            .up()
            .up()
            .ele(oc, 'search')
            .ele(oc, 'pattern')
            .txt(query)
            .up()
            .ele(oc, 'limit')
            .txt(limit.toString())
            .end(),
        });
        break;
    }

    check(response, {
      'client -> search.resource - status': ({ status }) => {
        return status === 207;
      },
    });

    return response;
  }

  tag(id: string, tag: string): RefinedResponse<'text'> {
    const oc = 'http://owncloud.org/ns';
    const dav = 'DAV:';
    let response;
    switch (this.#version) {
      case Version.occ:
      case Version.nc:
        response = endpoints.dav.files.REPORT__report_for_resources(this.#request, {
          userId: id,
          reportXml: create({ version: '1.0', encoding: 'UTF-8' })
            .ele(oc, 'filter-files')
            .ele(dav, 'prop')
            .ele(oc, 'fileid')
            .up()
            .up()
            .ele(oc, 'filter-rules')
            .ele(oc, 'systemtag')
            .txt(tag)
            .end(),
        });
        break;
      case Version.ocis:
      default:
        response = endpoints.dav.files.REPORT__report_for_resources(this.#request, {
          userId: id,
          reportXml: create({ version: '1.0', encoding: 'UTF-8' })
            .ele(oc, 'search-files')
            .ele(dav, 'prop')
            .ele(oc, 'fileid')
            .up()
            .up()
            .ele(oc, 'search')
            .ele(oc, 'pattern')
            .txt(`Tags:${tag}`)
            .up()
            .ele(oc, 'limit')
            .txt('200')
            .end(),
        });
        break;
    }

    check(response, {
      'client -> search.tag - status': ({ status }) => {
        return status === 207;
      },
    });

    return response;
  }
}
