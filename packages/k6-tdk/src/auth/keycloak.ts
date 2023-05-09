// @ts-ignore
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'
import http, { CookieJar } from 'k6/http'

import { check, cleanURL, objectToQueryString, queryStringToObject } from '@/utils'

import { AuthNHTTPProvider, Token } from './auth'

export class Keycloak implements AuthNHTTPProvider {
  jar: CookieJar

  readonly info

  private cache?: {
    validTo: Date
    token: Token
  }

  constructor(p: { userLogin: string, userPassword: string, baseUrl: string, realm: string, redirectUrl: string }) {
    this.info = {
      userLogin: p.userLogin,
      userPassword: p.userPassword,
      baseUrl: cleanURL(p.baseUrl),
      redirectUrl: cleanURL(p.redirectUrl),
      realm: p.realm
    }

    this.jar = new CookieJar()
  }


  get header(): string {
    const upsertCache = (t: Token) => {
      this.cache = {
        validTo: ((): Date => {
          const d = new Date()

          d.setSeconds(d.getSeconds() + t.expiresIn - Math.min(60, t.expiresIn * .1))

          return d
        })(),
        token: t
      }
    }

    const loginRequired = !this.cache
    if(loginRequired){
      const token = this.login()
      upsertCache(token)
    }

    const refreshRequired = this.cache && this.cache.validTo <= new Date()
    if(refreshRequired){
      const token = this.refreshTokens()
      upsertCache(token)
    }

    return `${this.cache!.token.tokenType} ${this.cache!.token.accessToken}`
  }

  private get endpoints() {
    const baseUrl = cleanURL(`${this.info.baseUrl}/realms/${this.info.realm}`)
    return {
      login: cleanURL(`${baseUrl}/protocol/openid-connect/auth`),
      token: cleanURL(`${baseUrl}/protocol/openid-connect/token`),
      userinfo: cleanURL(`${baseUrl}/protocol/openid-connect/userinfo`),
      introspect: cleanURL(`${baseUrl}/protocol/openid-connect/token/introspect`)
    }
  }

  public login(): Token {
    const loginParams = {
      login: 'true',
      response_type: 'code',
      scope: 'openid profile email',
      client_id: 'web',
      state: uuidv4(),
      redirect_uri: this.info.redirectUrl
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
      fields: { username: this.info.userLogin, password: this.info.userPassword },
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
      code,
      grant_type: 'authorization_code',
      redirect_uri: cleanURL(this.info.redirectUrl),
      client_id: 'web'
    }, { jar: this.jar })
    check({ val: accessTokenResponse }, {
      'authn -> accessTokenResponse - status': ({ status }) => {
        return status === 200
      }
    })
    if (accessTokenResponse.status !== 200) {
      throw new Error(`accessTokenResponse.status is ${accessTokenResponse.status}, expected 200`)
    }

    return {
      refreshToken: accessTokenResponse.json('refresh_token') as string,
      accessToken: accessTokenResponse.json('access_token') as string,
      tokenType: accessTokenResponse.json('token_type') as string,
      idToken: accessTokenResponse.json('id_token') as string,
      expiresIn: accessTokenResponse.json('expires_in') as number
    }
  }

  refreshTokens(): Token {
    const accessTokenResponse = http.post(this.endpoints.token, {
      grant_type: 'refresh_token',
      refresh_token: this.cache!.token.refreshToken,
      client_id: 'web'
    }, { jar: this.jar })


    check({ val: accessTokenResponse }, {
      'authn -> accessTokenResponse - status': ({ status }) => {
        return status === 200
      }
    })
    if (accessTokenResponse.status !== 200) {
      throw new Error(`accessTokenResponse.status is ${accessTokenResponse.status}, expected 200`)
    }

    return {
      refreshToken: accessTokenResponse.json('refresh_token') as string,
      accessToken: accessTokenResponse.json('access_token') as string,
      tokenType: accessTokenResponse.json('token_type') as string,
      idToken: accessTokenResponse.json('id_token') as string,
      expiresIn: accessTokenResponse.json('expires_in') as number
    }
  }
}

