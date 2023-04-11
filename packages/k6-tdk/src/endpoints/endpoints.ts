import { RefinedResponse, ResponseType } from 'k6/http';

import { Request } from '@/utils';

export type Endpoint<P extends Record<string, unknown> | undefined, RT extends ResponseType | undefined> = (r: Request, p: P) => RefinedResponse<RT>;

export const ShareType = {
  user: 0,
  group: 1,
  publicLink: 3,
  federatedCloudShare: 6,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ShareType = (typeof ShareType)[keyof typeof ShareType];

export const ItemType = {
  file: 'file',
  folder: 'folder',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export const Permission = {
  read: 0,
  update: 2,
  create: 4,
  delete: 8,
  share: 16,
  all: 31,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Permission = (typeof Permission)[keyof typeof Permission];
