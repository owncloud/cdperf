import { RequestBody } from 'k6/http'

import { Endpoint } from './endpoints'

export const POST__create_tag: Endpoint<{
  tagName: string,
  canAssignTag: boolean,
  userAssignableTag: boolean,
  userVisibleTag: boolean
}, 'none'> = (httpClient, {
  tagName, userAssignableTag = true, canAssignTag = true, userVisibleTag = true
}) => {
  return httpClient('POST', '/remote.php/dav/systemtags', JSON.stringify({
    name: tagName,
    canAssign: canAssignTag,
    userAssignable: userAssignableTag,
    userVisible: userVisibleTag
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export const DELETE__delete_tag: Endpoint<{ tagId: string }, 'none'> = (httpClient, { tagId }) => {
  return httpClient('DELETE', `/remote.php/dav/systemtags/${tagId}`)
}

export const PROPFIND__get_tags_with_properties: Endpoint<{
  propfindXml?: RequestBody
}, 'text'> = (httpClient, { propfindXml }) => {
  return httpClient('PROPFIND', '/remote.php/dav/systemtags', propfindXml)
}
