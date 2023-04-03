import { Request } from '@/utils/http';

import { Users } from './users';



export class Cloud {
  readonly users: Users;

  constructor(request: Request) {
    this.users = new Users(request);
  }
}
