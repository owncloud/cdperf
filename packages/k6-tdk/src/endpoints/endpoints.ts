export const ShareType = {
  user: 0,
  group: 1,
  publicLink: 3,
  federatedCloudShare: 6
} as const;

export type ShareType = (typeof ShareType)[keyof typeof ShareType];

export const ItemType = {
  file: 'file',
  folder: 'folder'
} as const;

export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export const Permission = {
  read: 0,
  update: 2,
  create: 4,
  delete: 8,
  share: 16,
  all: 31
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];
