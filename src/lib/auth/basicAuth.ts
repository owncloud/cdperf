import { Account } from './auth';

export class BasicAuthAdapter {
  readonly #account: Account;
  constructor(account: Account) {
    this.#account = account;
  }

  public get credential(): Account {
    return this.#account;
  }
}
