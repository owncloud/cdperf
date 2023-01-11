import { Account, Adapter, Credential } from './auth';
import { BasicAuthAdapter } from './basicAuth';
import { OpenIDConnect } from './openIDConnect';

export { Account, Adapter, Credential, Token } from './auth';

export class Auth {
  #adapter: { credential: Credential };
  constructor(account: Account, adapter: Adapter, baseURL: string) {
    switch (adapter) {
      case Adapter.openIDConnect:
        this.#adapter = new OpenIDConnect(account, baseURL);
        break;
      case Adapter.basicAuth:
        this.#adapter = new BasicAuthAdapter(account);
        break;
    }
  }

  public get credential(): Credential {
    return this.#adapter.credential;
  }
}
