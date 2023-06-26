import { test } from 'vitest'

import { noop } from './utils'

test.each([
  { parameters: [] },
  { parameters: ['nom', 'nom', '🍪'] }
])('noop(...$parameters) -> eats 🍪 and sends a few crumbs to nirvana...', ({ parameters }) => {
  // nothing to see or expect here, all cookies are eaten.... bin is empty... come back later...
  noop(...parameters)
})
