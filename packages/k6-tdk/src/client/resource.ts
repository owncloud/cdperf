import { RefinedResponse, RequestBody } from 'k6/http';

import { endpoints } from '@/endpoints';
import { check } from '@/utils';

import { EndpointClient, Platform } from './client';
import { RESOURCE__get_resource_properties } from './xml';

export class Resource extends EndpointClient {
  createResource(p: { root: string, resourcePath: string }): RefinedResponse<'none'> {
    let response: RefinedResponse<'none'>
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.dav.files.MKCOL__create_resource(this.request, p);
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.dav.spaces.MKCOL__create_resource(this.request, { ...p, driveId: p.root });
    }

    check({ val: response }, {
      'client -> resource.createResource - status': ({ status }) => {
        return status === 201;
      }
    });

    return response;
  }

  deleteResource(p: { resourcePath: string, root: string }): RefinedResponse<'none'> {
    let response: RefinedResponse<'none'>
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.dav.files.DELETE__delete_resource(this.request, p);
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.dav.spaces.DELETE__delete_resource(this.request, { ...p, driveId: p.root });
    }

    check({ val: response }, {
      'client -> resource.deleteResource - status': ({ status }) => {
        return status === 204;
      }
    });

    return response;
  }

  moveResource(p: { root: string, fromResourcePath: string, toResourcePath: string }): RefinedResponse<'none'> {
    let response: RefinedResponse<'none'>
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.dav.files.MOVE__move_resource(this.request, p);
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.dav.spaces.MOVE__move_resource(this.request, { ...p, driveId: p.root });
    }

    check({ val: response }, {
      'client -> resource.moveResource - status': ({ status }) => {
        return status === 201;
      }
    });

    return response;
  }

  getResourceProperties(p: { root: string, resourcePath: string }): RefinedResponse<'text'> {
    const propfindXml = RESOURCE__get_resource_properties[this.platform]({})

    let response: RefinedResponse<'text'>
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.dav.files.PROPFIND__get_properties_for_resource(this.request,
          { ...p, propfindXml });
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.dav.spaces.PROPFIND__get_properties_for_resource(this.request,
          { ...p, driveId: p.root, propfindXml });
    }

    check({ val: response }, {
      'client -> resource.getResourceProperties - status': ({ status }) => {
        return status === 207;
      }
    });

    return response;
  }

  uploadResource(p: { resourcePath: string, root: string, resourceBytes: RequestBody }): RefinedResponse<'none'> {
    let response: RefinedResponse<'none'>
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.dav.files.PUT__upload_resource(this.request, p);
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.dav.spaces.PUT__upload_resource(this.request, { ...p, driveId: p.root });
    }

    check({ val: response }, {
      'client -> resource.uploadResource - status': ({ status }) => {
        return status === 201;
      }
    });

    return response;
  }

  downloadResource(p: { resourcePath: string, root: string }): RefinedResponse<'binary'> {
    let response: RefinedResponse<'binary'>
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.dav.files.GET__download_resource(this.request, p);
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.dav.spaces.GET__download_resource(this.request,
          { ...p, driveId: p.root });
    }

    check({ val: response }, {
      'client -> resource.downloadResource - status': ({ status }) => {
        return status === 200;
      }
    });

    return response;
  }
}
