import { Request } from '@/utils/http';

import { Shares } from './shares';



export class V1 {
  readonly shares: Shares;

  constructor(request: Request) {
    this.shares = new Shares(request);
  }
}
