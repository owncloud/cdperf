import encoding from 'k6/encoding'

import { AuthNHTTPProvider } from './auth'

export class BasicAuth implements AuthNHTTPProvider {
  private readonly userLogin: string

  private readonly userPassword: string

  constructor(p: { userLogin: string, userPassword: string }) {
    this.userLogin = p.userLogin
    this.userPassword = p.userPassword
  }

  public get headers() {
    return { Authorization: `Basic ${encoding.b64encode(`${this.userLogin}:${this.userPassword}`)}` }
  }
}
