import { Client } from '@ownclouders/k6-tdk/lib/client'
import { queryXml } from '@ownclouders/k6-tdk/lib/utils'


export const getOrCreateTag = (p: {tagName: string, client: Client}) => {
  const getTagsResponse = p.client.tag.getTags()
  const [{ 'oc:id': existingTagId } = { 'oc:id': '' }] = queryXml(`$..[?(@['oc:display-name'] === '${p.tagName}')]`, getTagsResponse?.body)

  let createdTagId = ''
  if (!existingTagId) {
    const createTagResponse = p.client.tag.createTag({ tagName: p.tagName })
    const contentLocationHeader = createTagResponse?.headers['Content-Location'] || ''
    createdTagId = contentLocationHeader.split('/').pop() || ''
  }

  return existingTagId || createdTagId || p.tagName
}
