import { Options } from 'k6/options'

import { options as options_020, navigate_file_tree_020 } from '@/tests/koko/platform/020-navigate-file-tree/ramping.k6'
// import { options as options_030 } from '@/tests/koko/platform/030-search-for-filename/ramping.k6'
import { options as options_040, create_upload_rename_delete_folder_and_file_040 } from '@/tests/koko/platform/040-create-upload-rename-delete-folder-and-file/ramping.k6'
import { options as options_050, download_050 } from '@/tests/koko/platform/050-download/ramping.k6'
import { options as options_070, user_group_search_070 } from '@/tests/koko/platform/070-user-group-search/ramping.k6'
import { options as options_080, create_space_080 } from '@/tests/koko/platform/080-create-space/ramping.k6'
import { options as options_090, create_remove_group_share_090 } from '@/tests/koko/platform/090-create-remove-group-share/ramping.k6'
import { options as options_100, add_remove_tag_100 } from '@/tests/koko/platform/100-add-remove-tag/ramping.k6'
import { options as options_110, sync_client_110 } from '@/tests/koko/platform/110-sync-client/ramping.k6'



export const options: Options = {
  insecureSkipTLSVerify: true,
  scenarios: {
    ...options_020.scenarios,
    // ...options_030.scenarios,
    ...options_040.scenarios,
    ...options_050.scenarios,
    ...options_070.scenarios,
    ...options_080.scenarios,
    ...options_090.scenarios,
    ...options_100.scenarios,
    ...options_110.scenarios
  }
}
export {
  navigate_file_tree_020,
  create_upload_rename_delete_folder_and_file_040,
  download_050, user_group_search_070,
  create_space_080,
  create_remove_group_share_090,
  add_remove_tag_100, sync_client_110
}
