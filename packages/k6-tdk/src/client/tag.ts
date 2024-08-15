import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'

import { EndpointClient } from './client'

export class Tag extends EndpointClient {
  addTagToResource(p: { resourceId: string, tag: string }): RefinedResponse<'none'> {
    const response = endpoints.graph.v1.extensions.org_libre_graph.tags.PUT__add_tags_to_resource(this.httpClient, {
      resourceId: p.resourceId,
      tagNames: [p.tag]
    })

    check({ val: response }, {
      'client -> tag.addTagToResource - status': ({ status }) => {
        return status === 200
      }
    })

    return response
  }

  getTagForResource(): RefinedResponse<'text'> {
    const response = endpoints.graph.v1.extensions.org_libre_graph.tags.GET__get_tags_for_resource(this.httpClient, {})

    check({ val: response }, {
      'client -> tag.getTagForResource - status': ({ status }) => {
        return status === 200
      }
    })

    return response
  }

  removeTagFromResource(p: { resourceId: string, tag: string }): RefinedResponse<'none'> {
    const response = endpoints.graph.v1.extensions.org_libre_graph.tags.DELETE__remove_tags_from_resource(this.httpClient, {
      resourceId: p.resourceId,
      tagNames: [p.tag]
    })

    check({ val: response }, {
      'client -> tag.removeTagToResource - status': ({ status }) => {
        return status === 200
      }
    })

    return response
  }
}
