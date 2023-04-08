import { Request } from '@/utils/http';

import { Applications } from './applications';
import { Drives } from './drives';
import { Groups } from './groups';
import { Me } from './me';
import { Users } from './users';

export class V1 {
  readonly applications: Applications;

  readonly drives: Drives;

  readonly groups: Groups;

  readonly me: Me;

  readonly users: Users;

  constructor(request: Request) {
    this.applications = new Applications(request);
    this.drives = new Drives(request);
    this.groups = new Groups(request);
    this.me = new Me(request);
    this.users = new Users(request);
  }
}
