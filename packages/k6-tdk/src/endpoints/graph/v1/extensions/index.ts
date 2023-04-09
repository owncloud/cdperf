import { Request } from '@/utils/http';

import { OrgLibreGraph } from './orgLibreGraph';

export class Extensions {
  readonly orgLibreGraph: OrgLibreGraph;

  constructor(request: Request) {
    this.orgLibreGraph = new OrgLibreGraph(request);
  }
}
