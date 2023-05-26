import { Options } from 'k6/options'
import { omit } from 'lodash'

import { options as inherited_options } from './baseline.k6'

export { create_upload_rename_delete_folder_and_file_040 } from './simple.k6'

export const options: Options = {
  ...omit(inherited_options, 'iterations', 'duration'),
  scenarios: {
    create_upload_rename_delete_folder_and_file_040: {
      executor: 'ramping-vus',
      startVUs: 0,
      exec: 'create_upload_rename_delete_folder_and_file_040',
      env: {
        SLEEP_AFTER_ITERATION: '60s'
      },
      stages: [
        { target: 500, duration: '20m' },
        { target: 500, duration: '30m' },
        { target: 0, duration: '10m' }
      ]
    }
  }
}
