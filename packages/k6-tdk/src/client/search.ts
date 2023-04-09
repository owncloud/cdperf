import { check } from 'k6';
import { RefinedResponse } from 'k6/http';
import { Endpoints, ItemType } from 'src/endpoints';
import { create } from 'xmlbuilder2';

import { Version } from './client';

export class Search {
  #endpoints: Endpoints;

  #version: Version;

  constructor(version: Version, endpoints: Endpoints) {
    this.#version = version;
    this.#endpoints = endpoints;
  }

  sharee(search: string, itemType: ItemType): RefinedResponse<'text'> {
    const response = this.#endpoints.ocs.v2.apps.filesSharing.v1.sharees.search(search, itemType)

    check(response, {
      'client -> search.sharee - status': ({ status }) => {
        return status === 200
      }
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
      response = this.#endpoints.dav.files.report(id,
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
      response = this.#endpoints.dav.search(create({ version: '1.0', encoding: 'UTF-8' })
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
      }
    });

    return response;
  }

  tag(id: string, tag: string): RefinedResponse<'text'> {
    const oc = 'http://owncloud.org/ns'
    const dav = 'DAV:'
    let response;
    switch (this.#version) {
    case Version.ocis:
      response = this.#endpoints.dav.files.report(id,
        create({ version: '1.0', encoding: 'UTF-8' })
          .ele(oc, 'search-files')
          .ele(dav, 'prop')
          .ele(oc, 'fileid').up()
          .up()
          .ele(oc, 'search')
          .ele(oc, 'pattern')
          .txt(`Tags:${tag}`).up()
          .ele(oc, 'limit').txt('200')
          .end());
      break;
    case Version.occ:
    case Version.nc:
      response = this.#endpoints.dav.files.report(id,
        create({ version: '1.0', encoding: 'UTF-8' })
          .ele(oc, 'filter-files')
          .ele(dav, 'prop')
          .ele(oc, 'fileid')
          .up()
          .up()
          .ele(oc, 'filter-rules')
          .ele(oc, 'systemtag')
          .txt(tag)
          .end());
      break;
    }

    check(response, {
      'client -> search.tag - status': ({ status }) => {
        return status === 207
      }
    });

    return response;
  }
}
