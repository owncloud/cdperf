import { Request } from '@/utils/http';

import { Sharees } from './sharees';
import { Shares } from './shares';

export class V1 {
  readonly shares: Shares;

  readonly sharees: Sharees;

  readonly sharees: Sharees;

  readonly sharees: Sharees;

  constructor(request: Request) {
    this.shares = new Shares(request);
    this.sharees = new Sharees(request);
  }
}
