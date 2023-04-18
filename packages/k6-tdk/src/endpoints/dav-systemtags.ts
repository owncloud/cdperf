import { RequestBody } from 'k6/http'

import { Endpoint } from './endpoints'

export const POST__create_tag: Endpoint<{
  tagName: string,
  canAssignTag: boolean,
  userAssignableTag: boolean,
  userVisibleTag: boolean
}, 'none'> = (r, {
  tagName, userAssignableTag = true, canAssignTag = true, userVisibleTag = true
}) => {
  return r('POST', '/remote.php/dav/systemtags', JSON.stringify({
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

export const DELETE__delete_tag: Endpoint<{ tagId: string }, 'none'> = (r, { tagId }) => {
  return r('DELETE', `/remote.php/dav/systemtags/${tagId}`)
}

export const PROPFIND__get_tags_with_properties: Endpoint<{
  propfindXml?: RequestBody
}, 'text'> = (r, { propfindXml }) => {
  return r('PROPFIND', '/remote.php/dav/systemtags', propfindXml)
}
