import { Options } from 'k6/options'

import { create_remove_group_share_090, options as inherited_options } from './simple.k6'

export const options: Options = {
  ...inherited_options,
  iterations: 10,
  duration: '7d',
  teardownTimeout: '1h'
}

export default create_remove_group_share_090
