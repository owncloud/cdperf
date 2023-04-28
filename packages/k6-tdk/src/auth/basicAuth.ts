import encoding from 'k6/encoding'
import { CookieJar } from 'k6/http'

import { AuthNHTTPProvider } from './auth'

export class BasicAuth implements AuthNHTTPProvider {
  private readonly userLogin: string

  private readonly userPassword: string

  readonly jar: CookieJar

  constructor(p: { userLogin: string, userPassword: string }) {
    this.userLogin = p.userLogin
    this.userPassword = p.userPassword
    this.jar = new CookieJar()
  }

  public get header(): string {
    return `Basic ${encoding.b64encode(`${this.userLogin}:${this.userPassword}`)}`
  }
}
