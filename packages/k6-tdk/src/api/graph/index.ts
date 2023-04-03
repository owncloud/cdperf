import {Request} from '@/utils/http';

import { V1 } from './v1';



export class Graph {
  readonly v1: V1;

  constructor(request: Request) {
    this.v1 = new V1(request);
  }
}
