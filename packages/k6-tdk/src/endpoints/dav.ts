import { RequestBody } from 'k6/http';

import { Endpoint } from './endpoints';

export const SEARCH__search_for_resources: Endpoint<{
  searchXml?: RequestBody
}, 'text'> = (r, { searchXml }) => {
  return r('SEARCH', '/remote.php/dav', searchXml, {
    headers: {
      'Content-Type': 'application/xml'
    }
  })
}
