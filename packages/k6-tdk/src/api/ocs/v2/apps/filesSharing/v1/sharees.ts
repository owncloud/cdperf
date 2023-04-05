import { RefinedResponse } from 'k6/http';

import { ItemType } from '@/api';
import { objectToQueryString } from '@/utils';
import { Request } from '@/utils/http';

export class Sharees {
  protected request: Request;
  constructor(request: Request) {
    this.request = request;
  }
  
  search(search: string, itemType: ItemType, format: 'xml' | 'json' = 'json'): RefinedResponse<'text'> {
    return this.request('GET',
      `/ocs/v2.php/apps/files_sharing/api/v1/sharees?${objectToQueryString({
        search,
        itemType,
        format,
        page: 1,
        perPage: 200
      })}`,
      undefined,
      {
        headers: {
          'OCS-APIRequest': 'true',
        },
      });
  }
}
