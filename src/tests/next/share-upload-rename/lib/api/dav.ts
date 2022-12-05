import { check } from 'k6';
import http from 'k6/http';

import { types } from '../../../../../lib';
import { buildParams } from './utils';

export interface DavAPI {
  create(id: string, path: string, credential: types.Credential): void;
  delete(id: string, path: string, credential: types.Credential): void;
  move(id: string, source: string, target: string, credential: types.Credential): void;
  upload(id: string, destination: string, data: ArrayBuffer, credential: types.Credential): void;
}

export class DavLegacyAPI implements DavAPI {
  protected baseURL: string;
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  create(id: string, path: string, credential: types.Credential): void {
    const createResponse = http.request(
      'MKCOL',
      `${this.baseURL}/remote.php/dav/files/${id}/${path}`,
      undefined,
      buildParams({}, { credential }),
    );

    check(createResponse, {
      'dav create': ({ status }) => status === 201,
    });
  }

  delete(id: string, path: string, credential: types.Credential): void {
    const deleteResponse = http.request(
      'DELETE',
      `${this.baseURL}/remote.php/dav/files/${id}/${path}`,
      undefined,
      buildParams({}, { credential }),
    );

    check(deleteResponse, {
      'dav delete': ({ status }) => status === 204,
    });
  }

  move(id: string, source: string, target: string, credential: types.Credential): void {
    const moveResponse = http.request(
      'MOVE',
      `${this.baseURL}/remote.php/dav/files/${id}/${source}`,
      undefined,
      buildParams(
        {
          headers: {
            destination: `/remote.php/dav/files/${id}/${target}`,
          },
        },
        { credential },
      ),
    );

    check(moveResponse, {
      'dav move': ({ status }) => status === 201,
    });
  }

  upload(id: string, path: string, data: ArrayBuffer, credential: types.Credential): void {
    const uploadResponse = http.request(
      'PUT',
      `${this.baseURL}/remote.php/dav/files/${id}/${path}`,
      data,
      buildParams({}, { credential }),
    );

    check(uploadResponse, {
      'dav upload': ({ status }) => status === 201,
    });
  }
}

export class DavLatestAPI extends DavLegacyAPI implements DavAPI {
  create(id: string, path: string, credential: types.Credential): void {
    const createResponse = http.request(
      'MKCOL',
      `${this.baseURL}/remote.php/dav/spaces/${id}/${path}`,
      undefined,
      buildParams({}, { credential }),
    );

    check(createResponse, {
      'dav create': ({ status }) => status === 201,
    });
  }

  delete(id: string, path: string, credential: types.Credential): void {
    const deleteResponse = http.request(
      'DELETE',
      `${this.baseURL}/remote.php/dav/spaces/${id}/${path}`,
      undefined,
      buildParams({}, { credential }),
    );

    check(deleteResponse, {
      'dav delete': ({ status }) => status === 204,
    });
  }

  upload(id: string, path: string, data: ArrayBuffer, credential: types.Credential): void {
    const uploadResponse = http.request(
      'PUT',
      `${this.baseURL}/remote.php/dav/spaces/${id}/${path}`,
      data,
      buildParams({}, { credential }),
    );

    check(uploadResponse, {
      'dav upload': ({ status }) => status === 201,
    });
  }

  move(id: string, source: string, target: string, credential: types.Credential): void {
    const moveResponse = http.request(
      'MOVE',
      `${this.baseURL}/remote.php/dav/spaces/${id}/${source}`,
      undefined,

      buildParams(
        {
          headers: {
            destination: `/remote.php/dav/spaces/${id}/${target}`,
          },
        },
        { credential },
      ),
    );

    check(moveResponse, {
      'dav move': ({ status }) => status === 201,
    });
  }
}
