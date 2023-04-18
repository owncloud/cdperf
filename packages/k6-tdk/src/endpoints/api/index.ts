import { Request } from '@/utils/http';

import { V0 } from './v0';

export class Api {
  readonly v0: V0;

  constructor(request: Request) {
    this.v0 = new V0(request);
  }
}
