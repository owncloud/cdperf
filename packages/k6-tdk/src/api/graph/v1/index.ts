
import { Request } from '@/utils/http';

import { Me } from './me';
import { Users } from './users';


export class V1 {
  readonly me: Me;
  readonly users: Users;

  constructor(request: Request) {
    this.me = new Me(request);
    this.users = new Users(request);
  }
}
