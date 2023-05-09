import { objectToQueryString } from '@/utils'
import { ItemType } from '@/values'

import { Endpoint } from './endpoints'

export const GET__search_for_sharees: Endpoint<{
  searchQuery: string, searchItemType: ItemType
}, 'text'> = (httpClient, { searchQuery, searchItemType }) => {
  return httpClient('GET', `/ocs/v2.php/apps/files_sharing/api/v1/sharees?${objectToQueryString({
    search: searchQuery,
    itemType: searchItemType,
    format: 'json',
    page: 1,
    perPage: 200
  })}`, undefined, {
    headers: {
      'OCS-APIRequest': 'true'
    }
  })
}
