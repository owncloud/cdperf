import encoding from 'k6/encoding'
import { CookieJar } from 'k6/http'

import { AuthNHTTPProvider } from './auth'

export class BasicAuth implements AuthNHTTPProvider {
  readonly jar: CookieJar

  readonly info

  constructor(p: { userLogin: string, userPassword: string }) {
    this.info = { userLogin: p.userLogin, userPassword: p.userPassword }
    this.jar = new CookieJar()
  }

  public get header(): string {
    return `Basic ${encoding.b64encode(`${this.info.userLogin}:${this.info.userPassword}`)}`
  }
}
