import { check } from 'k6';
import http from 'k6/http';

import { Credential } from '../auth';
import { Result } from './api';
import { buildParams } from './utils';

export interface DavAPI {
  create(id: string, path: string, credential: Credential): Result;
  delete(id: string, path: string, credential: Credential): Result;
  move(id: string, source: string, target: string, credential: Credential): Result;
  upload(id: string, destination: string, data: ArrayBuffer, credential: Credential): Result;
}

export class DavLegacyAPI implements DavAPI {
  protected baseURL: string;
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  create(id: string, path: string, credential: Credential): Result {
    const createResponse = http.request(
      'MKCOL',
      `${this.baseURL}/remote.php/dav/files/${id}/${path}`,
      undefined,
      buildParams({}, { credential }),
    );

    check(createResponse, {
      'dav create': ({ status }) => status === 201,
    });

    return { response: createResponse };
  }

  delete(id: string, path: string, credential: Credential): Result {
    const deleteResponse = http.request(
      'DELETE',
      `${this.baseURL}/remote.php/dav/files/${id}/${path}`,
      undefined,
      buildParams({}, { credential }),
    );

    check(deleteResponse, {
      'dav delete': ({ status }) => status === 204,
    });

    return { response: deleteResponse };
  }

  move(id: string, source: string, target: string, credential: Credential): Result {
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

    return { response: moveResponse };
  }

  upload(id: string, path: string, data: ArrayBuffer, credential: Credential): Result {
    const uploadResponse = http.request(
      'PUT',
      `${this.baseURL}/remote.php/dav/files/${id}/${path}`,
      data,
      buildParams({}, { credential }),
    );

    check(uploadResponse, {
      'dav upload': ({ status }) => status === 201,
    });

    return { response: uploadResponse };
  }
}

export class DavLatestAPI extends DavLegacyAPI implements DavAPI {
  create(id: string, path: string, credential: Credential): Result {
    const createResponse = http.request(
      'MKCOL',
      `${this.baseURL}/remote.php/dav/spaces/${id}/${path}`,
      undefined,
      buildParams({}, { credential }),
    );

    check(createResponse, {
      'dav create': ({ status }) => status === 201,
    });

    return { response: createResponse };
  }

  delete(id: string, path: string, credential: Credential): Result {
    const deleteResponse = http.request(
      'DELETE',
      `${this.baseURL}/remote.php/dav/spaces/${id}/${path}`,
      undefined,
      buildParams({}, { credential }),
    );

    check(deleteResponse, {
      'dav delete': ({ status }) => status === 204,
    });

    return { response: deleteResponse };
  }

  upload(id: string, path: string, data: ArrayBuffer, credential: Credential): Result {
    const uploadResponse = http.request(
      'PUT',
      `${this.baseURL}/remote.php/dav/spaces/${id}/${path}`,
      data,
      buildParams({}, { credential }),
    );

    check(uploadResponse, {
      'dav upload': ({ status }) => status === 201,
    });

    return { response: uploadResponse };
  }

  move(id: string, source: string, target: string, credential: Credential): Result {
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

    return { response: moveResponse };
  }
}
