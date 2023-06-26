import { RequestBody } from 'k6/http'

import { Endpoint } from './endpoints'

export const SEARCH__search_for_resources: Endpoint<{
  searchXml?: RequestBody
}, 'text'> = (httpClient, { searchXml }) => {
  return httpClient('SEARCH', '/remote.php/dav', searchXml, {
    headers: {
      'Content-Type': 'application/xml'
    }
  })
}
