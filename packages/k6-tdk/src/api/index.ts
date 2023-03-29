
import { Request } from '@/utils/http';

import { Dav } from './dav';
import { Graph } from './graph';
import { Ocs } from './ocs';


export * from './api';

export class Api {
  readonly ocs: Ocs;
  readonly graph: Graph;
  readonly dav: Dav;

  constructor(request: Request) {
    this.ocs = new Ocs(request);
    this.graph = new Graph(request);
    this.dav = new Dav(request);
  }
}
