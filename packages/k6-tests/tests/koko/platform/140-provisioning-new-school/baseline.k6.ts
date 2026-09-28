import { Options } from 'k6/options'

import { options as inherited_options, provision_new_school_140 } from './simple.k6'

export { setup } from './simple.k6'

export const options: Options = {
  ...inherited_options,
  iterations: 10,
  duration: '7d'
}

export default provision_new_school_140
