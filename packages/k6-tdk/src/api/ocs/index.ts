import { Request } from '@/utils/http';

import { V2 } from './v2';



export class Ocs {
  readonly v2: V2;

  constructor(request: Request) {
    this.v2 = new V2(request);
  }
}
