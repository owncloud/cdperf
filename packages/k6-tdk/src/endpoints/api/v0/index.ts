import { Request } from '@/utils/http';

import { Settings } from './settings';

export class V0 {
  readonly settings: Settings;

  constructor(request: Request) {
    this.settings = new Settings(request);
  }
}
