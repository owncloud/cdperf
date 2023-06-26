import { Options } from 'k6/options'

import { navigate_file_tree_020, options as inherited_options } from './simple.k6'

export const options: Options = {
  ...inherited_options,
  iterations: 10,
  duration: '7d',
  teardownTimeout: '1h'
}

export default navigate_file_tree_020
