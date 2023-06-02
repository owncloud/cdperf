// @ts-ignore
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js'
import http, { CookieJar } from 'k6/http'

import { check, cleanURL, objectToQueryString, queryStringToObject } from '@/utils'

import { AuthNHTTPProvider, Token } from './auth'

export class Keycloak implements AuthNHTTPProvider {
  private readonly jar: CookieJar

  private readonly clientId: string

  private readonly userLogin: string

  private readonly userPassword: string

  private readonly baseUrl: string

  private readonly redirectUrl: string

  private readonly realm: string

  private readonly socialProviderRealm?: string

  private cache?: {
    validTo: Date
    token: Token
  }

  constructor(p: {
    userLogin: string,
    userPassword: string,
    baseUrl: string,
    redirectUrl: string,
    realm: string,
    clientId: string,
    jar: CookieJar,
    socialProviderRealm?: string
  }) {
    this.clientId = p.clientId
    this.userLogin = p.userLogin
    this.userPassword = p.userPassword
    this.baseUrl = p.baseUrl
    this.redirectUrl = p.redirectUrl
    this.realm = p.realm
    this.socialProviderRealm = p.socialProviderRealm
    this.jar = p.jar
  }


  get headers() {
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
    if (loginRequired) {
      const token = this.login()
      upsertCache(token)
    }

    const refreshRequired = this.cache && this.cache.validTo <= new Date()
    if (refreshRequired) {
      const token = this.refreshTokens()
      upsertCache(token)
    }

    return { Authorization: `${this.cache!.token.tokenType} ${this.cache!.token.accessToken}` }
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

  public login(): Token {
    const loginParams = {
      login: 'true',
      response_type: 'code',
      scope: 'openid profile email',
      client_id: this.clientId,
      state: uuidv4(),
      redirect_uri: this.redirectUrl
    }

    let loginPageResponse = http.get(`${this.endpoints.login}?${objectToQueryString(loginParams)}`, {
      jar: this.jar
    })

    check({ val: loginPageResponse }, {
      'authn -> loginPageResponse - status': ({ status }) => {
        return status === 200
      }
    })

    if (loginPageResponse.status !== 200) {
      throw new Error(`loginPageResponse.status is ${loginPageResponse.status}, expected 200`)
    }

    if (this.socialProviderRealm) {
      loginPageResponse = loginPageResponse.clickLink({
        selector: `#social-${this.socialProviderRealm}`, params: {
          jar: this.jar
        }
      })

      check({ val: loginPageResponse }, {
        'authn -> loginPageResponse - social - status': ({ status }) => {
          return status === 200
        }
      })

      if (loginPageResponse.status !== 200) {
        throw new Error(`loginPageResponse.status (social) is ${loginPageResponse.status}, expected 200`)
      }
    }

    const authorizationResponse = loginPageResponse.submitForm({
      formSelector: '#kc-form-login',
      fields: { username: this.userLogin, password: this.userPassword },
      params: { redirects: this.socialProviderRealm ? 1 : 0, jar: this.jar }
    })

    check({ val: authorizationResponse }, {
      'authn -> authorizationResponse - status': ({ status }) => {
        return status === 302
      }
    })

    if (authorizationResponse.status !== 302) {
      throw new Error(`authorizationResponse.status is ${authorizationResponse.status}, expected 302`)
    }

    const getCode = (headers: { [name: string]: string }) => {
      const { Location } = headers

      if(!Location){
        throw new Error('no location')
      }

      const { code } = queryStringToObject(Location)

      if(code){
        return code
      }

      const response = http.post(Location, {}, {
        jar: this.jar,
        redirects: 1
      })

      return getCode(response.headers)
    }

    const code = getCode(authorizationResponse.headers)
    const accessTokenResponse = http.post(this.endpoints.token, {
      code,
      grant_type: 'authorization_code',
      redirect_uri: cleanURL(this.redirectUrl),
      client_id: this.clientId
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
      client_id: this.clientId
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

