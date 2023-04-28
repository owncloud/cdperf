// @ts-ignore
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'
import http, { CookieJar } from 'k6/http'

import { check, cleanURL, objectToQueryString, queryStringToObject } from '@/utils'

import { AuthNHTTPProvider, Token } from './auth'

export class Keycloak implements AuthNHTTPProvider {
  private readonly userLogin: string

  private readonly userPassword: string

  private readonly baseUrl: string

  private readonly realm: string

  private readonly redirectUrl: string

  readonly jar: CookieJar

  private cache?: {
    validTo: Date
    token: Token
  }

  constructor(p: { userLogin: string, userPassword: string, baseUrl: string, realm: string, redirectUrl: string }) {
    this.userLogin = p.userLogin
    this.userPassword = p.userPassword
    this.baseUrl = cleanURL(p.baseUrl)
    this.redirectUrl = cleanURL(p.redirectUrl)
    this.realm = p.realm
    this.jar = new CookieJar()
  }



  get header(): string {
    if (!this.cache || this.cache.validTo <= new Date()) {
      const token = this.authenticate()
      this.cache = {
        validTo: ((): Date => {
          const offset = 5
          const d = new Date()

          d.setSeconds(d.getSeconds() + token.expiresIn - offset)

          return d
        })(),
        token
      }
    }

    return `${this.cache.token.tokenType} ${this.cache.token.accessToken}`
  }

  private get endpoints() {
    const baseUrl = cleanURL(`${this.baseUrl}/realms/${this.realm}`)
    return {
      login: cleanURL(`${baseUrl}/protocol/openid-connect/auth`),
      token: cleanURL(`${baseUrl}/protocol/openid-connect/token`),
      userinfo: cleanURL(`${baseUrl}/protocol/openid-connect/userinfo`),
      introspect: cleanURL(`${baseUrl}/protocol/openid-connect/token/introspect`)
    }
  }

  public authenticate(): Token {
    const loginParams = {
      login: 'true',
      response_type: 'code',
      scope: 'openid profile email',
      client_id: 'web',
      state: uuidv4(),
      redirect_uri: this.redirectUrl
    }


    const loginPageResponse = http.get(`${this.endpoints.login}?${objectToQueryString(loginParams)}`, {
      jar: this.jar
    })
    check({ val: loginPageResponse }, {
      'authn -> loginPageResponse - status': ({ status }) => {
        return status === 200
      }
    })
    if (loginPageResponse.status !== 200) {
      throw new Error(`login_page.status is ${loginPageResponse.status}, expected 200`)
    }
    const authorizationResponse = loginPageResponse.submitForm({
      formSelector: '#kc-form-login',
      fields: { username: this.userLogin, password: this.userPassword },
      params: { redirects: 0, jar: this.jar }
    })

    check({ val: authorizationResponse }, {
      'authn -> authorizationResponse - status': ({ status }) => {
        return status === 302
      }
    })
    if (authorizationResponse.status !== 302) {
      throw new Error(`authorizationResponse.status is ${authorizationResponse.status}, expected 302`)
    }

    const { code } = queryStringToObject(authorizationResponse.headers.Location)
    const accessTokenResponse = http.post(this.endpoints.token, {
      'grant_type': 'authorization_code',
      'code': code,
      'redirect_uri': cleanURL(this.redirectUrl),
      'client_id': 'web'
    }, { jar: this.jar })
    check({ val: accessTokenResponse }, {
      'authn ->accessTokenResponse - status': ({ status }) => {
        return status === 200
      }
    })
    if (accessTokenResponse.status !== 200) {
      throw new Error(`accessTokenResponse.status is ${accessTokenResponse.status}, expected 200`)
    }

    return {
      accessToken: accessTokenResponse.json('access_token') as string,
      tokenType: accessTokenResponse.json('token_type') as string,
      idToken: accessTokenResponse.json('id_token') as string,
      expiresIn: accessTokenResponse.json('expires_in') as number
    }
  }
}
