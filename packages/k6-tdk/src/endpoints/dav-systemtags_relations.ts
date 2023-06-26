import { RequestBody } from 'k6/http'

import { Endpoint } from './endpoints'

export const PUT__add_tag_to_resource: Endpoint<{ resourceId: string, tagId: string }, 'none'> = (httpClient, {
  tagId,
  resourceId
}) => {
  return httpClient('PUT', `/remote.php/dav/systemtags-relations/files/${resourceId}/${tagId}`)
}

export const DELETE__remove_tag_from_resource: Endpoint<{
  resourceId: string,
  tagId: string
}, 'none'> = (httpClient, { tagId, resourceId }) => {
  return httpClient('DELETE', `/remote.php/dav/systemtags-relations/files/${resourceId}/${tagId}`)
}

export const PROPFIND__get_tags_with_properties_for_resource: Endpoint<{
  resourceId: string,
  propfindXml?: RequestBody
}, 'text'> = (httpClient, { propfindXml, resourceId }) => {
  return httpClient('PROPFIND', `/remote.php/dav/systemtags-relations/files/${resourceId}`, propfindXml)
}
