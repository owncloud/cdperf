import { RefinedResponse, RequestBody } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'

import { EndpointClient } from './client'
import { RESOURCE__get_resource_properties } from './xml'

export class Resource extends EndpointClient {
  createResource(p: { root: string, resourcePath: string }): RefinedResponse<'none'> {
    const response = endpoints.dav.spaces.MKCOL__create_resource(this.httpClient, { ...p, driveId: p.root })

    check({ val: response }, {
      'client -> resource.createResource - status': ({ status }) => {
        return status === 201
      }
    })

    return response
  }

  deleteResource(p: { resourcePath: string, root: string }): RefinedResponse<'none'> {
    const response = endpoints.dav.spaces.DELETE__delete_resource(this.httpClient, { ...p, driveId: p.root })
    
    check({ val: response }, {
      'client -> resource.deleteResource - status': ({ status }) => {
        return status === 204
      }
    })

    return response
  }

  moveResource(p: { root: string, fromResourcePath: string, toResourcePath: string }): RefinedResponse<'none'> {
    const response = endpoints.dav.spaces.MOVE__move_resource(this.httpClient, { ...p, driveId: p.root })

    check({ val: response }, {
      'client -> resource.moveResource - status': ({ status }) => {
        return status === 201
      }
    })

    return response
  }

  getResourceProperties(p: { root: string, resourcePath: string }): RefinedResponse<'text'> {
    const propfindXml = RESOURCE__get_resource_properties()

    const response = endpoints.dav.spaces.PROPFIND__get_properties_for_resource(this.httpClient,
      { ...p, driveId: p.root, propfindXml })

    check({ val: response }, {
      'client -> resource.getResourceProperties - status': ({ status }) => {
        return status === 207
      }
    })

    return response
  }

  uploadResource(p: { resourcePath: string, root: string, resourceBytes: RequestBody }): RefinedResponse<'none'> {
    const response = endpoints.dav.spaces.PUT__upload_resource(this.httpClient, { ...p, driveId: p.root })

    check({ val: response }, {
      'client -> resource.uploadResource - status': ({ status }) => {
        return status === 201
      }
    })

    return response
  }

  downloadResource(p: { resourcePath: string, root: string }): RefinedResponse<'binary'> {
    const response = endpoints.dav.spaces.GET__download_resource(this.httpClient,
      { ...p, driveId: p.root })

    check({ val: response }, {
      'client -> resource.downloadResource - status': ({ status }) => {
        return status === 200
      }
    })

    return response
  }
}
