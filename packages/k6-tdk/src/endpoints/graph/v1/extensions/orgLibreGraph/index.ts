import { Request } from '@/utils/http';

import { Tags } from './tags';

export class OrgLibreGraph {
  readonly tags: Tags;

  constructor(request: Request) {
    this.tags = new Tags(request);
  }
}
