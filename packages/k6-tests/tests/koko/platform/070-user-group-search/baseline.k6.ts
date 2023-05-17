import { Options } from 'k6/options'

import { options as inherited_options, user_group_search_070 } from './simple.k6'

export const options: Options = {
  ...inherited_options,
  iterations: 10,
  duration: '7d',
  teardownTimeout: '1h'
}

export default user_group_search_070
