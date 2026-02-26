import { Options } from 'k6/options'

import { options as inherited_options, ldap_group_writes_130 } from './simple.k6'

export const options: Options = {
  ...inherited_options,
  iterations: 10,
  duration: '7d',
  teardownTimeout: '1h'
}

export default ldap_group_writes_130
