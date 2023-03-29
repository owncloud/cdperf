import { check } from 'k6';
import { RefinedResponse, RequestBody } from 'k6/http';

import { Api } from '../api';
import { Version } from './client';


export class Resource {
  #api: Api;
  #version: Version;
  constructor(version: Version, api: Api) {
    this.#version = version;
    this.#api = api;
  }

  upload(id: string, path: string, body: RequestBody): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
      case Version.latest:
        response = this.#api.dav.spaces.upload(id, path, body);
        break;
      case Version.legacy:
        response = this.#api.dav.files.upload(id, path, body);
        break;
    }

    check(response, {
      'client -> dav.upload - status': ({ status }) => status === 201,
    });

    return response;
  }

  create(id: string, path: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
      case Version.latest:
        response = this.#api.dav.spaces.create(id, path);
        break;
      case Version.legacy:
        response = this.#api.dav.files.create(id, path);
        break;
    }

    check(response, {
      'client -> dav.create - status': ({ status }) => status === 201,
    });

    return response;
  }

  download(id: string, path: string): RefinedResponse<'binary'> {
    let response;
    switch (this.#version) {
      case Version.latest:
        response = this.#api.dav.spaces.download(id, path);
        break;
      case Version.legacy:
        response = this.#api.dav.files.download(id, path);
        break;
    }

    check(response, {
      'client -> dav.download - status': ({ status }) => status === 200,
    });

    return response;
  }

  propfind(id: string, path: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
      case Version.latest:
        response = this.#api.dav.spaces.propfind(id, path);
        break;
      case Version.legacy:
        response = this.#api.dav.files.propfind(id, path);
        break;
    }

    check(response, {
      'client -> dav.propfind - status': ({ status }) => status === 207,
    });

    return response;
  }

  delete(id: string, path: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
      case Version.latest:
        response = this.#api.dav.spaces.delete(id, path);
        break;
      case Version.legacy:
        response = this.#api.dav.files.delete(id, path);
        break;
    }

    check(response, {
      'client -> dav.delete - status': ({ status }) => status === 204,
    });

    return response;
  }

  move(id: string, from: string, to: string): RefinedResponse<'text'> {
    let response;
    switch (this.#version) {
      case Version.latest:
        response = this.#api.dav.spaces.move(id, from, to);
        break;
      case Version.legacy:
        response = this.#api.dav.files.move(id, from, to);
        break;
    }

    check(response, {
      'client -> dav.move - status': ({ status }) => status === 201,
    });

    return response;
  }
}
