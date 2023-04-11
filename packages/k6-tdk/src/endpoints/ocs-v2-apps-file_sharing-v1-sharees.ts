import { objectToQueryString } from '@/utils';

import { Endpoint, ItemType } from './endpoints';

export const GET__search_sharees: Endpoint<{ searchQuery: string, searchItemType: ItemType }, 'text'> = (r, { searchQuery, searchItemType }) => {
  return r('GET', `/ocs/v2.php/apps/files_sharing/api/v1/sharees?${objectToQueryString({
    search: searchQuery,
    itemType: searchItemType,
    format: 'json',
    page: 1,
    perPage: 200,
  })}`, undefined, {
    headers: {
      'OCS-APIRequest': 'true',
    },
  });
};
