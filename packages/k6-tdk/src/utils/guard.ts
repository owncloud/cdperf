import { Platform } from '@/values'

export const platformGuard = (platform: Platform) => {
  return {
    isOwnCloudInfiniteScale: platform === Platform.ownCloudInfiniteScale,
    isOwnCloudServer: platform === Platform.ownCloudServer,
    isNextcloud: platform === Platform.nextcloud
  }
}
