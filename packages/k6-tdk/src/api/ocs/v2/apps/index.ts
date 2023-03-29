import { Request } from '@/utils/http';

import { FilesSharing } from './filesSharing';



export class Apps {
  readonly filesSharing: FilesSharing;

  constructor(request: Request) {
    this.filesSharing = new FilesSharing(request);
  }
}
