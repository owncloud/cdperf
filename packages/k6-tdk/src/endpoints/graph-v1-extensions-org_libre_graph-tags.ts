import { Endpoint } from './endpoints'

export const PUT__add_tags_to_resource: Endpoint<{ resourceId: string, tagNames: string[] }, 'none'> = (httpClient, {
  tagNames,
  resourceId
}) => {
  return httpClient('PUT', '/graph/v1.0/extensions/org.libregraph/tags', JSON.stringify({
    resourceId,
    tags: tagNames
  }))
}

export const DELETE__remove_tags_from_resource: Endpoint<{
  resourceId: string,
  tagNames: string[]
}, 'none'> = (httpClient, { tagNames, resourceId }) => {
  return httpClient('DELETE', '/graph/v1.0/extensions/org.libregraph/tags', JSON.stringify({
    resourceId,
    tags: tagNames
  }))
}

export const GET__get_tags_for_resource: Endpoint< {}, 'text'> = (httpClient) => {
  return httpClient('GET', '/graph/v1.0/extensions/org.libregraph/tags')
}
