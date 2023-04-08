import { Request } from '@/utils/http';

import { Groups } from './groups';
import { Roles } from './roles';
import { Users } from './users';

export class Cloud {
  readonly users: Users;

  readonly groups: Groups;

  readonly roles: Roles;

  constructor(request: Request) {
    this.users = new Users(request);
    this.groups = new Groups(request);
    this.roles = new Roles(request);
  }
}
