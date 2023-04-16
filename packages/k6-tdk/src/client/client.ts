import { Request } from '@/utils';

export const Platform = {
  ownCloudInfiniteScale: 'ownCloudInfiniteScale',
  ownCloudServer: 'ownCloudServer',
  nextcloud: 'nextcloud'
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Platform = (typeof Platform)[keyof typeof Platform];

export abstract class EndpointClient {
  protected readonly platform: Platform;

  protected readonly request: Request;

  constructor(platform: Platform, request: Request) {
    this.platform = platform;
    this.request = request;
  }
}
