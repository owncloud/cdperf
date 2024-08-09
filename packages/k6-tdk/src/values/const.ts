export const ShareType = {
  user: 'user',
  group: 'group'
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ShareType = (typeof ShareType)[keyof typeof ShareType];

export const ItemType = {
  file: 'file',
  folder: 'folder'
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export const Roles = {
  editor: 'fb6c3e19-e378-47e5-b277-9732f9de6e21',
  fileEditor: '2d00ce52-1fc2-4dbc-8b95-a73b73395f5a',
  viewer: 'b1e2218d-eef8-4d4c-b82d-0f1a1b48f3b5',
  spaceManager: '312c0871-5ef7-4b3a-85b6-0e4074c64049',
  spaceEditor: '58c63c02-1d89-4572-916a-870abc5a1b7d',
  spaceViewer: 'a8d5fe5e-96e3-418d-825b-534dbdf22b99'
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Roles = (typeof Roles)[keyof typeof Roles];

export const Platform = {
  ownCloudInfiniteScale: 'ownCloudInfiniteScale',
  ownCloudServer: 'ownCloudServer',
  nextcloud: 'nextcloud'
} as const

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Platform = (typeof Platform)[keyof typeof Platform];
