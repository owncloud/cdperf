import { RefinedResponse } from 'k6/http'

import { endpoints } from '@/endpoints'
import { check } from '@/utils'
import { ItemType, Platform } from '@/values'

import { EndpointClient } from './client'
import { SEARCH__search_for_resources, SEARCH__search_for_resources_by_tag } from './xml'

export class Search extends EndpointClient {
  searchForSharees(p: { searchQuery: string, searchItemType: ItemType }): RefinedResponse<'text'> {
    const response = endpoints.ocs.v2.apps.file_sharing.v1.sharees.GET__search_for_sharees(this.httpClient, p)

    check({ val: response }, {
      'client -> search.searchForSharees - status': ({ status }) => {
        return status === 200
      }
    })

    return response
  }

  searchForResources(p: { root: string, searchQuery: string, searchLimit?: number }): RefinedResponse<'text'> {
    let response: RefinedResponse<'text'>
    switch (this.platform) {
      case Platform.nextcloud:
        response = endpoints.dav.SEARCH__search_for_resources(this.httpClient, {
          searchXml: SEARCH__search_for_resources[this.platform](p)
        })
        break
      case Platform.ownCloudServer:
      case Platform.ownCloudInfiniteScale:
      default:
        response = endpoints.dav.files.REPORT__get_report_for_resources(this.httpClient, {
          ...p,
          reportXml: SEARCH__search_for_resources[this.platform](p)
        })
    }

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
      reportXml: SEARCH__search_for_resources_by_tag[this.platform](p)
    })

    check({ val: response }, {
      'client -> search.searchForResourcesByTag - status': ({ status }) => {
        return status === 207
      }
    })

    return response
  }
}
