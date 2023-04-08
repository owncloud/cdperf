import { Request } from '@/utils/http';

import { Api } from './api';
import { Dav } from './dav';
import { Graph } from './graph';
import { Ocs } from './ocs';

export * from './endpoints';
export class Endpoints {
  readonly ocs: Ocs;

  readonly graph: Graph;

  readonly dav: Dav;

  readonly api: Api;

  constructor(request: Request) {
    this.ocs = new Ocs(request);
    this.graph = new Graph(request);
    this.dav = new Dav(request);
    this.api = new Api(request);
  }
}
