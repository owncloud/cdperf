import { Platform } from '@/const';
import { Request } from '@/utils';


export abstract class EndpointClient {
  protected readonly platform: Platform;

  protected readonly request: Request;

  constructor(platform: Platform, request: Request) {
    this.platform = platform;
    this.request = request;
  }
}
