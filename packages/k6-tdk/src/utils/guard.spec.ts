import { expect, test } from 'vitest'

import { Platform } from '@/values'

import { platformGuard } from './guard'

test.each([
  { platform: Platform.ownCloudInfiniteScale },
  { platform: Platform.ownCloudServer },
  { platform: Platform.nextcloud }
])('platformGuard returns a list of guards to provide information the requested platform ($platform) is detected)', ({ platform }) => {
  const {
    isOwnCloudInfiniteScale,
    isOwnCloudServer,
    isNextcloud
  } = platformGuard(platform as Platform)

  expect(isOwnCloudInfiniteScale).toBe(platform === Platform.ownCloudInfiniteScale)
  expect(isOwnCloudServer).toBe(platform === Platform.ownCloudServer)
  expect(isNextcloud).toBe(platform === Platform.nextcloud)
})
