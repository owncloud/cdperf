import { Options } from 'k6/options'

import { options as inherited_options, ldap_create_group_add_users_and_delete_group_130 } from './simple.k6'

export const options: Options = {
  ...inherited_options,
  iterations: 10,
  duration: '7d',
  teardownTimeout: '1h'
}

export default ldap_create_group_add_users_and_delete_group_130
