import { check } from 'k6';
import { RefinedResponse } from 'k6/http';

import { Api } from '@/api';
import { Account } from '@/auth';

import { Version } from './client';


export class User {
  #api: Api;
  #version: Version;
  constructor(version: Version, api: Api) {
    this.#version = version;
    this.#api = api;
  }

  drives(): RefinedResponse<'text'> | undefined {
    if (this.#version !== Version.ocis) {
      return;
    }

    const response = this.#api.graph.v1.me.drives();

    check(response, {
      'client -> user.drives - status': ({ status }) => status === 200,
    });

    return response;
  }

  me(): RefinedResponse<'text'> | undefined {
    if (this.#version !== Version.ocis) {
      return;
    }

    const response = this.#api.graph.v1.me.me();

    if (!response) {
      return;
    }

    check(response, {
      'client -> user.me - status': ({ status }) => status === 200,
    });

    return response;
  }

  enable(id: string): RefinedResponse<'text'> | undefined {
    if (this.#version === Version.ocis) {
      return;
    }

    const response = this.#api.ocs.v2.cloud.users.enable(id);

    check(response, {
      'client -> user.enable - status': ({ status }) => status === 200,
    });

    return response;
  }

  create(account: Account): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
      case Version.ocis:
        response = this.#api.graph.v1.users.create(account);
        break;
      case Version.occ:
      case Version.nc:
        response = this.#api.ocs.v2.cloud.users.create(account);
        break;
    }

    check(response, {
      'client -> user.create - status': ({ status }) => status === 200,
    });

    return response;
  }

  delete(id: string): RefinedResponse<'text'> {
    let response;
    let statusSuccess: number;

    switch (this.#version) {
      case Version.ocis:
        response = this.#api.graph.v1.users.delete(id);
        statusSuccess = 204;
        break;
      case Version.occ:
      case Version.nc:
        response = this.#api.ocs.v2.cloud.users.delete(id);
        statusSuccess = 200;
        break;
    }

    check(response, {
      'client -> user.delete - status': ({ status }) => status === statusSuccess,
    });

    return response;
  }
}
