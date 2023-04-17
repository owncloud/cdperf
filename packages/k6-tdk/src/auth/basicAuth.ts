import encoding from 'k6/encoding'

import { Authenticator } from './auth'

export class BasicAuth implements Authenticator {
  private readonly userLogin: string

  private readonly userPassword: string

  constructor(p: { userLogin: string, userPassword: string }) {
    this.userLogin = p.userLogin
    this.userPassword = p.userPassword
  }

  public get header(): string {
    return `Basic ${encoding.b64encode(`${this.userLogin}:${this.userPassword}`)}`
  }
}
