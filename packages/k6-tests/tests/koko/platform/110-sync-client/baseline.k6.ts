import { Options } from 'k6/options'

import { options as inherited_options, sync_client_110 } from './simple.k6'

export const options: Options = {
  ...inherited_options,
  iterations: 10,
  duration: '7d',
  teardownTimeout: '1h'
}

export default sync_client_110
