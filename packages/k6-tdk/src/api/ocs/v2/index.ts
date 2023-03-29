
import { Request } from '@/utils/http';

import { Apps } from './apps';
import { Cloud } from './cloud';


export class V2 {
  readonly cloud: Cloud;
  readonly apps: Apps;

  constructor(request: Request) {
    this.cloud = new Cloud(request);
    this.apps = new Apps(request);
  }
}
