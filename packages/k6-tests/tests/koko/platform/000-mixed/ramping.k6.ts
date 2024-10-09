import { Options } from 'k6/options'

import { options as options_020 } from '@/tests/koko/platform/020-navigate-file-tree/ramping.k6'
// import { options as options_030 } from '@/tests/koko/platform/030-search-for-filename/ramping.k6'
import { options as options_040 } from '@/tests/koko/platform/040-create-upload-rename-delete-folder-and-file/ramping.k6'
import { options as options_050 } from '@/tests/koko/platform/050-download/ramping.k6'
import { options as options_070 } from '@/tests/koko/platform/070-user-group-search/ramping.k6'
import { options as options_080 } from '@/tests/koko/platform/080-create-space/ramping.k6'
import { options as options_090 } from '@/tests/koko/platform/090-create-remove-group-share/ramping.k6'
import { options as options_100 } from '@/tests/koko/platform/100-add-remove-tag/ramping.k6'
import { options as options_110 } from '@/tests/koko/platform/110-sync-client/ramping.k6'

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
