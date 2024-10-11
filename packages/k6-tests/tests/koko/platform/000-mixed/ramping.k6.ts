import { Options } from 'k6/options'
import { envValues } from '@/values'

import { options as options_020 } from '@/tests/koko/platform/020-navigate-file-tree/ramping.k6'
// import { options as options_030 } from '@/tests/koko/platform/030-search-for-filename/ramping.k6'
import { options as options_040 } from '@/tests/koko/platform/040-create-upload-rename-delete-folder-and-file/ramping.k6'
import { options as options_050 } from '@/tests/koko/platform/050-download/ramping.k6'
import { options as options_070 } from '@/tests/koko/platform/070-user-group-search/ramping.k6'
import { options as options_080 } from '@/tests/koko/platform/080-create-space/ramping.k6'
import { options as options_090 } from '@/tests/koko/platform/090-create-remove-group-share/ramping.k6'
import { options as options_100 } from '@/tests/koko/platform/100-add-remove-tag/ramping.k6'
import { options as options_110 } from '@/tests/koko/platform/110-sync-client/ramping.k6'

export { navigate_file_tree_020 } from '@/tests/koko/platform/020-navigate-file-tree/simple.k6'
export { search_for_filename_030 } from '@/tests/koko/platform/030-search-for-filename/simple.k6'
export {
  create_upload_rename_delete_folder_and_file_040
} from '@/tests/koko/platform/040-create-upload-rename-delete-folder-and-file/simple.k6'
export { download_050 } from '@/tests/koko/platform/050-download/simple.k6'
export { user_group_search_070 } from '@/tests/koko/platform/070-user-group-search/simple.k6'
export { create_space_080 } from '@/tests/koko/platform/080-create-space/simple.k6'
export { create_remove_group_share_090 } from '@/tests/koko/platform/090-create-remove-group-share/simple.k6'
export { add_remove_tag_100 } from '@/tests/koko/platform/100-add-remove-tag/simple.k6'
export { sync_client_110 } from '@/tests/koko/platform/110-sync-client/simple.k6'

const settings = {
  ...envValues()
}

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
  },
  ...(settings.thresholds.enabled && {
    thresholds: {
      http_req_failed: [settings.thresholds.rate],
      http_req_duration: [settings.thresholds.duration]
    }
  })
}
