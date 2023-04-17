export const Platform = {
  ownCloudInfiniteScale: 'ownCloudInfiniteScale',
  ownCloudServer: 'ownCloudServer',
  nextcloud: 'nextcloud'
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Platform = (typeof Platform)[keyof typeof Platform];
