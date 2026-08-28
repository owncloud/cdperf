import { Options } from 'k6/options'

import { open_change_save_010, open_change_save_010_setup, open_change_save_010_teardown, options as inherited_options } from './simple.k6'

export const options: Options = {
  ...inherited_options,
  iterations: 10,
  duration: '7d',
  teardownTimeout: '1h'
}

export const setup = open_change_save_010_setup
export default open_change_save_010
export const teardown = open_change_save_010_teardown
