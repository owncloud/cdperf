import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'
import { Platform } from '@/values'

import { EndpointClient } from './client'
import { TAG__get_tags, TAG__get_tags_for_resource } from './xml'

export class Tag extends EndpointClient {
  createTag(p: {
    tagName: string,
    canAssignTag?: boolean,
    userAssignableTag?: boolean,
    userVisibleTag?: boolean
  }): RefinedResponse<'none'> | undefined {
    const {
      tagName,
      userAssignableTag = true,
      userVisibleTag = true,
      canAssignTag = true
    } = p

    let response: RefinedResponse<'none'> | undefined
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.dav.systemtags.POST__create_tag(this.httpClient, {
          tagName,
          userAssignableTag,
          userVisibleTag,
          canAssignTag
        })
        break
      case Platform.ownCloudInfiniteScale:
      default:
    }

    check({ skip: !response, val: response }, {
      'client -> tag.createTag - status': (r) => {
        return r?.status === 201
      }
    })

    return response
  }

  deleteTag(p: { tag: string }): RefinedResponse<'none'> | undefined {
    let response: RefinedResponse<'none'>| undefined
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.dav.systemtags.DELETE__delete_tag(this.httpClient, { tagId: p.tag })
        break
      case Platform.ownCloudInfiniteScale:
      default:
    }

    check({ skip: !response, val: response }, {
      'client -> tag.deleteTag - status': (r) => {
        return r?.status === 204
      }
    })

    return response
  }

  getTags(): RefinedResponse<'text'> | undefined {
    let response: RefinedResponse<'text'>| undefined
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.dav.systemtags.PROPFIND__get_tags_with_properties(this.httpClient, {
          propfindXml: TAG__get_tags[this.platform]({})
        })
        break
      case Platform.ownCloudInfiniteScale:
      default:
    }

    check({ skip: !response, val: response }, {
      'client -> tag.getTags - status': (r) => {
        return r?.status === 207
      }
    })

    return response
  }

  addTagToResource(p: { resourceId: string, tag: string }): RefinedResponse<'none'> {
    let response: RefinedResponse<'none'>
    let expectedStatus: number
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        expectedStatus = 201
        response = endpoints.dav.systemtags_relations.PUT__add_tag_to_resource(this.httpClient, {
          resourceId: p.resourceId,
          tagId: p.tag
        })
        break
      case Platform.ownCloudInfiniteScale:
      default:
        expectedStatus = 200
        response = endpoints.graph.v1.extensions.org_libre_graph.tags.PUT__add_tags_to_resource(this.httpClient, {
          resourceId: p.resourceId,
          tagNames: [p.tag]
        })
    }

    check({ val: response }, {
      'client -> tag.addTagToResource - status': ({ status }) => {
        return status === expectedStatus
      }
    })

    return response
  }

  removeTagFromResource(p: { resourceId: string, tag: string }): RefinedResponse<'none'> {
    let response: RefinedResponse<'none'>
    let expectedStatus: number
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        expectedStatus = 204
        response = endpoints.dav.systemtags_relations.DELETE__remove_tag_from_resource(this.httpClient, {
          resourceId: p.resourceId,
          tagId: p.tag
        })
        break
      case Platform.ownCloudInfiniteScale:
      default:
        expectedStatus = 200
        response = endpoints.graph.v1.extensions.org_libre_graph.tags.DELETE__remove_tags_from_resource(this.httpClient, {
          resourceId: p.resourceId,
          tagNames: [p.tag]
        })
    }

    check({ val: response }, {
      'client -> tag.removeTagToResource - status': ({ status }) => {
        return status === expectedStatus
      }
    })

    return response
  }

  getTagsForResource(p: { root: string, resourceId: string, resourcePath: string }): RefinedResponse<'text'> {
    const propfindXml = TAG__get_tags_for_resource[this.platform]({})

    let response: RefinedResponse<'text'>
    switch (this.platform) {
      case Platform.ownCloudServer:
      case Platform.nextcloud:
        response = endpoints.dav.systemtags_relations.PROPFIND__get_tags_with_properties_for_resource(this.httpClient,
          { resourceId: p.resourceId, propfindXml })
        break
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.dav.spaces.PROPFIND__get_properties_for_resource(this.httpClient,
          { driveId: p.root, resourcePath: p.resourcePath, propfindXml })
    }

    check({ val: response }, {
      'client -> tag.getTagsForResource - status': ({ status }) => {
        return status === 207
      }
    })

    return response
  }
}
