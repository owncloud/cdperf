import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'

import { EndpointClient } from './client'
import { SEARCH__search_for_resources, SEARCH__search_for_resources_by_tag } from './xml'

export class Search extends EndpointClient {
  searchForResources(p: { root: string, searchQuery: string, searchLimit?: number }): RefinedResponse<'text'> {
    const response = endpoints.dav.files.REPORT__get_report_for_resources(this.httpClient, {
      ...p,
      reportXml: SEARCH__search_for_resources(p)
    })

    check({ val: response }, {
      'client -> search.searchForResources - status': ({ status }) => {
        return status === 207
      }
    })

    return response
  }

  searchForResourcesByTag(p: { root: string, tag: string }): RefinedResponse<'text'> {
    const response = endpoints.dav.files.REPORT__get_report_for_resources(this.httpClient, {
      ...p,
      reportXml: SEARCH__search_for_resources_by_tag(p)
    })

    check({ val: response }, {
      'client -> search.searchForResourcesByTag - status': ({ status }) => {
        return status === 207
      }
    })

    return response
  }
}
