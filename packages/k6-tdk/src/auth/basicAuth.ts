import encoding from 'k6/encoding';

import { Account, Authenficator } from './auth';


export class BasicAuth implements Authenficator {
  readonly #account: Account;
  constructor(account: Account) {
    this.#account = account;
  }

  public get header(): string {
    return `Basic ${encoding.b64encode(`${this.#account.login}:${this.#account.password}`)}`;
  }
}
