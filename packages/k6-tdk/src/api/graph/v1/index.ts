import { Request } from '@/utils/http';

import { Groups } from './groups';
import { Me } from './me';
import { Users } from './users';

export class V1 {
  readonly me: Me;
  readonly users: Users;
  readonly groups: Groups;

  constructor(request: Request) {
    this.me = new Me(request);
    this.users = new Users(request);
    this.groups = new Groups(request);
  }
}
