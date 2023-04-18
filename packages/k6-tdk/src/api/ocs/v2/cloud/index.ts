import { Request } from '@/utils/http';

import { Groups } from './groups';
import { Users } from './users';

export class Cloud {
  readonly users: Users;
  readonly groups: Groups;

  constructor(request: Request) {
    this.users = new Users(request);
    this.groups = new Groups(request);
  }
}
