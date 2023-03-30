
import { Request } from '@/utils/http';

import { Files } from './files';
import { Spaces } from './spaces';

export class Dav {
  readonly files: Files;
  readonly spaces: Spaces;

  constructor(request: Request) {
    this.files = new Files(request);
    this.spaces = new Spaces(request);
  }
}
