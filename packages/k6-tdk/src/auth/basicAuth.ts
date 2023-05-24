import encoding from 'k6/encoding'
import { CookieJar } from 'k6/http'

import { AuthNHTTPProvider } from './auth'

export class BasicAuth implements AuthNHTTPProvider {
  private readonly jar: CookieJar

  private readonly userLogin: string

  private readonly userPassword: string

  constructor(p: { userLogin: string, userPassword: string, jar: CookieJar }) {
    this.userLogin = p.userLogin
    this.userPassword = p.userPassword
    this.jar = p.jar
  }

  public get headers() {
    return { Authorization: `Basic ${encoding.b64encode(`${this.userLogin}:${this.userPassword}`)}` }
  }
}
