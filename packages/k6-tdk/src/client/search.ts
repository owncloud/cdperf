import { check } from 'k6';
import { RefinedResponse } from 'k6/http';
import { create } from 'xmlbuilder2';

import { Api, ItemType } from '@/api';

import { Version } from './client';

export class Search {
  #api: Api;
  #version: Version;

  constructor(version: Version, api: Api) {
    this.#version = version;
    this.#api = api;
  }

  sharee(search: string, itemType: ItemType): RefinedResponse<'text'> {
    const response = this.#api.ocs.v2.apps.filesSharing.v1.sharees.search(search, itemType)

    check(response, {
      'client -> search.sharee - status': ({ status }) => {
        return status === 200
      },
    });

    return response
  }

  resource(id: string, { query = '', limit = 10 }): RefinedResponse<'text'> {
    const oc = 'http://owncloud.org/ns'
    const dav = 'DAV:'

    let response;
    switch (this.#version) {
    case Version.ocis:
    case Version.occ:
      response = this.#api.dav.files.report(id,
        create({ version: '1.0', encoding: 'UTF-8' })
          .ele(oc, 'search-files')
          .ele(dav, 'prop')
          .ele(oc, 'fileid').up()
          .up()
          .ele(oc, 'search')
          .ele(oc, 'pattern').txt(query).up()
          .ele(oc, 'limit').txt(limit.toString())
          .end());
      break;
    case Version.nc:
      response = this.#api.dav.search(create({ version: '1.0', encoding: 'UTF-8' })
        .ele(dav, 'searchrequest')
        .ele(dav, 'basicsearch')
        .ele(dav, 'select')
        .ele(dav, 'prop')
        .ele(oc, 'fileid')
        .up().up().up()
        .ele(dav, 'from')
        .ele(dav, 'scope')
        .ele(dav, 'href').txt(`/files/${id}`).up()
        .ele(dav, 'depth').txt('infinity').up()
        .up().up()
        .ele(dav, 'where')
        .ele(dav, 'like')
        .ele(dav, 'prop')
        .ele(dav, 'displayname')
        .up().up()
        .ele(dav, 'literal').txt(query)
        .up().up()
        .ele(dav, 'orderby')
        .end());
      break;
    }

    check(response, {
      'client -> search.resource - status': ({ status }) => {
        return status === 207
      },
    });

    return response;
  }
}
